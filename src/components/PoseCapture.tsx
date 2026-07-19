import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Camera,
  Square,
  Play,
  CircleCheck,
  CircleAlert,
  Video,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  POSE_CONNECTIONS,
  LM,
  sampleFromLandmarks,
  summarizeSamples,
  type Landmark,
  type AutoMetricsSummary,
} from "@/lib/poseMetrics";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

type Orientation = "frontal" | "lateral";
type CameraFacing = "user" | "environment";

interface MovementPreset {
  key: string;
  label: string;
  idealView: Orientation;
  hint: string;
}

const PRESETS: MovementPreset[] = [
  {
    key: "agachamento",
    label: "Agachamento",
    idealView: "frontal",
    hint: "Pés na largura do quadril",
  },
  {
    key: "flexao_tronco",
    label: "Flexão de tronco",
    idealView: "lateral",
    hint: "Perfil para a câmera",
  },
  {
    key: "elevacao_mmss",
    label: "Elevação de MMSS",
    idealView: "frontal",
    hint: "Braços visíveis",
  },
  {
    key: "ponte",
    label: "Ponte",
    idealView: "lateral",
    hint: "Deitado, perfil para a câmera",
  },
  {
    key: "livre",
    label: "Movimento livre",
    idealView: "frontal",
    hint: "Corpo inteiro no quadro",
  },
];

interface Props {
  assessmentId: string;
  patientId: string;
  clinicId: string;
  consentImageUse: boolean;
  editable: boolean;
  onSaved?: () => void;
}

interface QualityStatus {
  ok: boolean;
  fullBody: boolean;
  visibilityOk: boolean;
  orientationOk: boolean;
  cameraLevelOk: boolean;
  distanceOk: boolean;
  centeredOk: boolean;
  meanVisibility: number;
  reasons: string[];
  message: string;
}

interface FrameRecord {
  t: number;
  lm: Array<{ x: number; y: number; z?: number; v?: number }>;
}

const VISIBILITY_THRESHOLD = 0.5;
const KEY_LM = [
  LM.NOSE,
  LM.LEFT_SHOULDER,
  LM.RIGHT_SHOULDER,
  LM.LEFT_HIP,
  LM.RIGHT_HIP,
  LM.LEFT_KNEE,
  LM.RIGHT_KNEE,
  LM.LEFT_ANKLE,
  LM.RIGHT_ANKLE,
];

function evaluateQuality(lms: Landmark[] | null, orientation: Orientation): QualityStatus {
  if (!lms || lms.length < 29) {
    return {
      ok: false,
      fullBody: false,
      visibilityOk: false,
      orientationOk: false,
      cameraLevelOk: false,
      distanceOk: false,
      centeredOk: false,
      meanVisibility: 0,
      reasons: ["Nenhuma pessoa detectada"],
      message: "Posicione o corpo inteiro em frente à câmera",
    };
  }

  const key = KEY_LM.map((i) => lms[i]).filter(Boolean) as Landmark[];
  const meanVis = key.reduce((acc, p) => acc + (p.visibility ?? 0), 0) / Math.max(1, key.length);
  const visibilityOk = meanVis >= VISIBILITY_THRESHOLD;

  const nose = lms[LM.NOSE];
  const la = lms[LM.LEFT_ANKLE];
  const ra = lms[LM.RIGHT_ANKLE];
  const ls = lms[LM.LEFT_SHOULDER];
  const rs = lms[LM.RIGHT_SHOULDER];
  const lh = lms[LM.LEFT_HIP];
  const rh = lms[LM.RIGHT_HIP];

  const inFrame = (p?: Landmark) => !!p && p.x >= 0.03 && p.x <= 0.97 && p.y >= 0.03 && p.y <= 0.97;
  const headVisible = inFrame(nose) && (nose?.visibility ?? 0) > 0.3;
  const feetVisible =
    inFrame(la) && inFrame(ra) && (la?.visibility ?? 0) > 0.3 && (ra?.visibility ?? 0) > 0.3;
  const fullBody = headVisible && feetVisible;

  // A distância real varia entre lentes e ambientes. Usamos o tamanho relativo da pessoa no quadro.
  const ankleY = Math.max(la?.y ?? 0, ra?.y ?? 0);
  const personHeight = ankleY - (nose?.y ?? 0);
  const distanceOk = personHeight >= 0.55 && personHeight <= 0.92;

  const centerPoints = [ls, rs, lh, rh].filter(Boolean) as Landmark[];
  const bodyCenterX =
    centerPoints.reduce((acc, point) => acc + point.x, 0) / Math.max(1, centerPoints.length);
  const centeredOk = bodyCenterX >= 0.28 && bodyCenterX <= 0.72;

  // Apenas aviso: uma assimetria clínica verdadeira não deve bloquear a captura.
  const shTilt = ls && rs ? Math.abs(ls.y - rs.y) : 1;
  const hipTilt = lh && rh ? Math.abs(lh.y - rh.y) : 1;
  const cameraLevelOk = shTilt < 0.08 && hipTilt < 0.08;

  // Orientação estimada pela largura relativa de ombros e quadris.
  const shoulderWidth = ls && rs ? Math.hypot(ls.x - rs.x, ls.y - rs.y) : 0;
  const hipWidth = lh && rh ? Math.hypot(lh.x - rh.x, lh.y - rh.y) : 0;
  let orientationOk = false;
  if (orientation === "frontal") {
    orientationOk = shoulderWidth > 0.12 && hipWidth > 0.08;
  } else {
    orientationOk = shoulderWidth < 0.1 || hipWidth < 0.07;
  }

  const reasons: string[] = [];
  if (!headVisible) reasons.push("Mostre o topo da cabeça");
  if (!feetVisible) reasons.push("Mostre os pés completamente");
  if (!fullBody && headVisible && feetVisible) reasons.push("Corpo incompleto no quadro");
  if (!visibilityOk) reasons.push("Melhore a iluminação e deixe o corpo visível");
  if (!distanceOk) {
    reasons.push(personHeight < 0.55 ? "Aproxime a câmera" : "Afaste a câmera");
  }
  if (!centeredOk) reasons.push("Centralize o corpo no quadro");
  if (!orientationOk) {
    reasons.push(
      orientation === "frontal" ? "Fique de frente para a câmera" : "Fique de lado para a câmera",
    );
  }
  if (!cameraLevelOk) reasons.push("Confira se o celular está nivelado e paralelo ao chão");

  const ok = fullBody && visibilityOk && orientationOk && distanceOk && centeredOk;
  const message = ok
    ? cameraLevelOk
      ? "Enquadramento adequado — pode iniciar"
      : "Enquadramento adequado — confira o nível da câmera"
    : (reasons[0] ?? "Ajuste o enquadramento");

  return {
    ok,
    fullBody,
    visibilityOk,
    orientationOk,
    cameraLevelOk,
    distanceOk,
    centeredOk,
    meanVisibility: meanVis,
    reasons,
    message,
  };
}

export function PoseCapture({
  assessmentId,
  patientId,
  clinicId,
  consentImageUse,
  editable,
  onSaved,
}: Props) {
  const [preset, setPreset] = useState<MovementPreset>(PRESETS[0]);
  const [orientation, setOrientation] = useState<Orientation>(PRESETS[0].idealView);
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("environment");
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [switchingCamera, setSwitchingCamera] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityStatus | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const framesRef = useRef<FrameRecord[]>([]);
  const recordingRef = useRef(false);
  const startedAtRef = useRef(0);
  const orientationRef = useRef<Orientation>(orientation);

  useEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const refreshVideoInputs = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoInputs(devices.filter((device) => device.kind === "videoinput"));
    } catch {
      setVideoInputs([]);
    }
  }, []);

  const openCameraStream = useCallback(
    async (facing: CameraFacing) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não oferece suporte ao uso da câmera.");
      }

      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: facing },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error("Elemento de vídeo indisponível.");
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      await refreshVideoInputs();
    },
    [refreshVideoInputs, stopStream],
  );

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stopStream();
    if (landmarkerRef.current?.close) {
      try {
        landmarkerRef.current.close();
      } catch {
        /* ignore */
      }
    }
    landmarkerRef.current = null;
    setCameraOn(false);
    setEngineReady(false);
    setQuality(null);
    setRecording(false);
    recordingRef.current = false;
  }, [stopStream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const drawOverlay = useCallback(
    (lms: Landmark[] | null, w: number, h: number, currentQuality: QualityStatus) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const guideColor = !lms
        ? "rgba(148,163,184,0.8)"
        : currentQuality.ok
          ? "rgba(52,211,153,0.95)"
          : "rgba(251,191,36,0.95)";

      // Guia de enquadramento: cabeça e pés devem permanecer dentro da área.
      ctx.save();
      ctx.strokeStyle = guideColor;
      ctx.setLineDash([10, 7]);
      ctx.lineWidth = 3;
      const gx = w * 0.5;
      const gy = h * 0.5;
      const gw = w * 0.34;
      const gh = h * 0.86;
      ctx.strokeRect(gx - gw / 2, gy - gh / 2, gw, gh);
      ctx.beginPath();
      ctx.moveTo(gx, gy - gh / 2);
      ctx.lineTo(gx, gy + gh / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      if (!lms) return;
      ctx.lineWidth = 3;
      ctx.strokeStyle = guideColor;
      ctx.fillStyle = guideColor;
      for (const [a, b] of POSE_CONNECTIONS) {
        const pa = lms[a];
        const pb = lms[b];
        if (!pa || !pb) continue;
        if ((pa.visibility ?? 1) < 0.3 || (pb.visibility ?? 1) < 0.3) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x * w, pa.y * h);
        ctx.lineTo(pb.x * w, pb.y * h);
        ctx.stroke();
      }
      for (const point of lms) {
        if (!point || (point.visibility ?? 1) < 0.3) continue;
        ctx.beginPath();
        ctx.arc(point.x * w, point.y * h, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
  );

  const startCamera = useCallback(async () => {
    if (!consentImageUse) {
      toast.error("Consentimento de uso de imagem necessário.");
      return;
    }
    setEngineError(null);
    setEngineLoading(true);
    setQuality(null);
    try {
      await openCameraStream(cameraFacing);

      if (!landmarkerRef.current) {
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        landmarkerRef.current = landmarker;
      }

      setCameraOn(true);
      setEngineReady(true);

      const loop = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker) return;
        if (video.readyState >= 2) {
          const ts = performance.now();
          const result = landmarker.detectForVideo(video, ts);
          const lms: Landmark[] | null =
            result?.landmarks && result.landmarks.length > 0
              ? (result.landmarks[0] as Landmark[])
              : null;
          const currentQuality = evaluateQuality(lms, orientationRef.current);
          setQuality(currentQuality);
          drawOverlay(lms, video.videoWidth || 1280, video.videoHeight || 720, currentQuality);
          if (recordingRef.current && lms) {
            framesRef.current.push({
              t: ts - startedAtRef.current,
              lm: lms.map((point) => ({
                x: Math.round(point.x * 10000) / 10000,
                y: Math.round(point.y * 10000) / 10000,
                z: point.z !== undefined ? Math.round(point.z * 10000) / 10000 : undefined,
                v:
                  point.visibility !== undefined
                    ? Math.round(point.visibility * 100) / 100
                    : undefined,
              })),
            });
            setElapsedMs(ts - startedAtRef.current);
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao iniciar a câmera.";
      setEngineError(message);
      toast.error(message);
      stopCamera();
    } finally {
      setEngineLoading(false);
    }
  }, [cameraFacing, consentImageUse, drawOverlay, openCameraStream, stopCamera]);

  const switchCamera = useCallback(
    async (requestedFacing?: CameraFacing) => {
      if (!cameraOn || switchingCamera || recordingRef.current || countdown !== null) return;

      const previousFacing = cameraFacing;
      const nextFacing =
        requestedFacing ?? (cameraFacing === "environment" ? "user" : "environment");
      if (nextFacing === previousFacing) return;

      setSwitchingCamera(true);
      setQuality(null);
      try {
        await openCameraStream(nextFacing);
        setCameraFacing(nextFacing);
        toast.success(
          nextFacing === "environment"
            ? "Câmera traseira selecionada."
            : "Câmera frontal selecionada.",
        );
      } catch (error) {
        try {
          await openCameraStream(previousFacing);
        } catch {
          setEngineReady(false);
          setCameraOn(false);
        }
        const message =
          error instanceof Error ? error.message : "Não foi possível alternar a câmera.";
        toast.error(message);
      } finally {
        setSwitchingCamera(false);
      }
    },
    [cameraFacing, cameraOn, countdown, openCameraStream, switchingCamera],
  );

  const startRecording = useCallback(() => {
    if (!engineReady || !quality?.ok) {
      toast.error("Ajuste o enquadramento até o indicador ficar verde.");
      return;
    }
    setRejectReason(null);
    setLastSavedId(null);
    setCountdown(3);
    let n = 3;
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        framesRef.current = [];
        startedAtRef.current = performance.now();
        setElapsedMs(0);
        recordingRef.current = true;
        setRecording(true);
      } else {
        setCountdown(n);
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }, [engineReady, quality?.ok]);

  const finishRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    const frames = framesRef.current.slice();
    const durationMs = frames.length ? frames[frames.length - 1].t : 0;

    if (frames.length < 8 || durationMs < 800) {
      setRejectReason("Captura muito curta — refaça com pelo menos 1 segundo.");
      return;
    }

    // Gate agregado: exige percentual mínimo de frames com qualidade adequada.
    let goodFrames = 0;
    let visSum = 0;
    for (const frame of frames) {
      const asLm: Landmark[] = frame.lm.map((point) => ({
        x: point.x,
        y: point.y,
        z: point.z,
        visibility: point.v,
      }));
      const frameQuality = evaluateQuality(asLm, orientationRef.current);
      if (frameQuality.ok) goodFrames += 1;
      visSum += frameQuality.meanVisibility;
    }
    const goodRatio = goodFrames / frames.length;
    const meanVis = visSum / frames.length;
    if (goodRatio < 0.6) {
      setRejectReason(
        `Qualidade insuficiente — apenas ${Math.round(goodRatio * 100)}% dos quadros passaram no gate. Recapture com melhor enquadramento (${quality?.reasons[0] ?? "verifique posição e distância"}).`,
      );
      return;
    }

    setSaving(true);
    try {
      const fps = frames.length / (durationMs / 1000);
      // Motor biomecânico v1: para agachamento, gera resumo determinístico
      // além da série bruta de landmarks. Bloqueia se não houver ao menos
      // 1 repetição válida na estimativa.
      let biomechanics: AutoMetricsSummary | null = null;
      if (preset.key === "agachamento") {
        const samples = frames
          .map((frame) => {
            const asLm: Landmark[] = frame.lm.map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
              visibility: point.v,
            }));
            return sampleFromLandmarks(asLm, frame.t / 1000);
          })
          .filter((sample): sample is NonNullable<typeof sample> => !!sample);
        biomechanics = summarizeSamples(samples, durationMs / 1000, "squat");
        if (biomechanics.reps_valid < 1) {
          setRejectReason(
            `Nenhuma repetição válida detectada (${biomechanics.reps_total} tentativa(s), confiança média ${Math.round(biomechanics.mean_confidence * 100)}%). Refaça a captura executando o agachamento com amplitude e ritmo consistentes.`,
          );
          setSaving(false);
          return;
        }
      }
      const insertPayload = {
        assessment_id: assessmentId,
        patient_id: patientId,
        clinic_id: clinicId,
        exercise_key: preset.key,
        exercise_label: preset.label,
        orientation: orientationRef.current,
        duration_ms: Math.round(durationMs),
        fps: Math.round(fps * 100) / 100,
        frame_count: frames.length,
        engine: "mediapipe-pose-landmarker",
        engine_version: "tasks-vision-0.10.35",
        quality: {
          ok: true,
          good_frame_ratio: Math.round(goodRatio * 100) / 100,
          mean_visibility: Math.round(meanVis * 100) / 100,
          orientation_required: orientationRef.current,
          camera_facing: cameraFacing,
          visibility_threshold: VISIBILITY_THRESHOLD,
          biomechanics: biomechanics ?? undefined,
          analysis_kind: preset.key === "agachamento" ? "biomechanics-mvp-v1" : "basic",
          note: "Estimativa 2D — apoio à decisão, requer confirmação clínica.",
        },
        landmarks: frames,
      };
      const { data, error } = await supabase
        .from("pose_captures")
        .insert(insertPayload as any)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      setLastSavedId((data as { id: string }).id);
      toast.success("Série de landmarks salva. Nenhum vídeo foi armazenado.");
      framesRef.current = [];
      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar captura.");
    } finally {
      setSaving(false);
    }
  }, [assessmentId, cameraFacing, clinicId, onSaved, patientId, preset, quality]);

  if (!editable) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
        Avaliação finalizada — captura somente leitura.
      </div>
    );
  }

  if (!consentImageUse) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm">
        <div className="mb-1 font-medium text-amber-100">Consentimento necessário</div>
        <p className="text-amber-100/80">
          A captura por câmera exige o consentimento de uso de imagem do paciente. Nenhum vídeo é
          gravado — apenas a série temporal de pontos do corpo é armazenada.
        </p>
      </div>
    );
  }

  const hasMultipleCameras = videoInputs.length > 1;
  const cameraLabel = cameraFacing === "environment" ? "Traseira" : "Frontal";
  const blockingReasons = quality?.reasons.filter(
    (reason) => reason !== "Confira se o celular está nivelado e paralelo ao chão",
  );
  const guidanceDetails = quality?.ok
    ? quality.cameraLevelOk
      ? "Mantenha a posição e inicie a captura."
      : "O enquadramento está válido. Confirme visualmente se o celular está nivelado."
    : blockingReasons && blockingReasons.length > 1
      ? blockingReasons.slice(0, 2).join(" · ")
      : "Comece a cerca de 2,5–3 m e ajuste até cabeça e pés aparecerem por completo.";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">Prepare a câmera antes da captura</div>
            <p className="mt-1 text-sm text-muted-foreground">
              A distância em metros é apenas uma referência. O indicador verde confirma o
              enquadramento adequado para a lente utilizada.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">1. Estabilize o aparelho</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Use tripé ou apoio firme. Não segure o celular durante o movimento.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">2. Ajuste a altura</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Posicione a lente aproximadamente na altura do quadril e paralela ao chão.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">3. Comece a 2,5–3 m</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Aproxime ou afaste conforme a mensagem exibida sobre a imagem.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">4. Mostre o corpo inteiro</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Cabeça, mãos, joelhos, tornozelos e pés devem permanecer visíveis.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">5. Evite distorções</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Não use zoom digital e, quando possível, prefira a câmera traseira principal.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <span className="font-medium">6. Aguarde o verde</span>
            <p className="mt-1 text-xs text-muted-foreground">
              A captura só será liberada quando posição, distância e visibilidade estiverem
              adequadas.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Movimento avaliado</div>
            <Select
              value={preset.key}
              onValueChange={(value) => {
                const nextPreset = PRESETS.find((item) => item.key === value) ?? PRESETS[0];
                setPreset(nextPreset);
                setOrientation(nextPreset.idealView);
              }}
              disabled={cameraOn && recording}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-1 text-xs text-muted-foreground">{preset.hint}</div>
          </div>
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Orientação</div>
            <Select
              value={orientation}
              onValueChange={(value) => setOrientation(value as Orientation)}
              disabled={cameraOn && recording}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontal">Frontal</SelectItem>
                <SelectItem value="lateral">Lateral</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-1 text-xs text-muted-foreground">
              Ideal: {preset.idealView === "frontal" ? "Frontal" : "Lateral"}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Câmera</div>
            <Select
              value={cameraFacing}
              onValueChange={(value) => {
                const nextFacing = value as CameraFacing;
                if (cameraOn) {
                  void switchCamera(nextFacing);
                } else {
                  setCameraFacing(nextFacing);
                }
              }}
              disabled={recording || countdown !== null || engineLoading || switchingCamera}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">Traseira — recomendada</SelectItem>
                <SelectItem value="user">Frontal</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-1 text-xs text-muted-foreground">
              {cameraFacing === "environment"
                ? "Maior qualidade e menor distorção"
                : "Útil para autoenquadramento"}
            </div>
          </div>
          <div className="flex items-end gap-2">
            {!cameraOn ? (
              <Button
                variant="hero"
                size="sm"
                onClick={startCamera}
                disabled={engineLoading}
                className="w-full"
              >
                {engineLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Ligar câmera
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={stopCamera} className="w-full">
                Desligar câmera
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-black/60">
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-contain" />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" /> Câmera desligada
              </div>
            </div>
          )}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="font-display text-8xl font-semibold text-white">{countdown}</div>
            </div>
          )}
          {cameraOn && (
            <>
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <Badge className="border-slate-500/50 bg-black/55 text-white">
                  Câmera {cameraLabel.toLowerCase()}
                </Badge>
                {recording && (
                  <Badge className="border-red-500/50 bg-red-500/25 text-red-100">
                    ● REC {(elapsedMs / 1000).toFixed(1)}s
                  </Badge>
                )}
              </div>

              {hasMultipleCameras && !recording && countdown === null && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void switchCamera()}
                  disabled={switchingCamera}
                  className="absolute right-3 top-3 bg-black/55 text-white hover:bg-black/70"
                >
                  {switchingCamera ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Alternar câmera
                </Button>
              )}

              <div
                className={`absolute bottom-3 left-3 right-3 rounded-lg border px-4 py-3 backdrop-blur-sm ${
                  quality?.ok
                    ? "border-emerald-400/60 bg-emerald-950/75 text-emerald-50"
                    : quality
                      ? "border-amber-400/60 bg-amber-950/80 text-amber-50"
                      : "border-slate-400/50 bg-slate-950/75 text-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {quality?.ok ? (
                    <CircleCheck className="h-5 w-5 shrink-0" />
                  ) : (
                    <CircleAlert className="h-5 w-5 shrink-0" />
                  )}
                  <span>{quality?.message ?? "Aguardando detecção do corpo…"}</span>
                </div>
                <div className="mt-1 text-xs opacity-85">{guidanceDetails}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {engineError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {engineError}
        </div>
      )}

      {cameraOn && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Visibilidade média: {Math.round((quality?.meanVisibility ?? 0) * 100)}% · limite mínimo{" "}
            {Math.round(VISIBILITY_THRESHOLD * 100)}% · câmera {cameraLabel.toLowerCase()}
          </div>
          <div className="flex items-center gap-2">
            {!recording ? (
              <Button
                variant="hero"
                size="sm"
                onClick={startRecording}
                disabled={!quality?.ok || countdown !== null || saving || switchingCamera}
              >
                <Play className="h-4 w-4" /> Iniciar captura
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={finishRecording} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Encerrar e validar
              </Button>
            )}
          </div>
        </div>
      )}

      {quality?.ok && !quality.cameraLevelOk && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          A captura está liberada, mas confira visualmente se o aparelho está nivelado. A inclinação
          de ombros ou quadris pode representar uma assimetria real e, por isso, não bloqueia o
          exame.
        </div>
      )}

      {rejectReason && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          <div className="font-medium">Qualidade insuficiente — recapturar</div>
          <div className="mt-1 text-amber-100/80">{rejectReason}</div>
        </div>
      )}

      {lastSavedId && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Série de landmarks salva. Nenhum vídeo foi armazenado — apenas coordenadas para apoio à
          decisão clínica.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Estimativa de pose executada localmente no navegador (MediaPipe). O vídeo não é enviado nem
        salvo. Apoio à decisão — requer confirmação profissional.
      </p>
    </div>
  );
}
