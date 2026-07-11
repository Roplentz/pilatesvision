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
import { Loader2, Camera, Square, Play, CircleCheck, CircleAlert, Video } from "lucide-react";
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

interface MovementPreset {
  key: string;
  label: string;
  idealView: Orientation;
  hint: string;
}

const PRESETS: MovementPreset[] = [
  { key: "agachamento", label: "Agachamento", idealView: "frontal", hint: "Pés na largura do quadril" },
  { key: "flexao_tronco", label: "Flexão de tronco", idealView: "lateral", hint: "Perfil para a câmera" },
  { key: "elevacao_mmss", label: "Elevação de MMSS", idealView: "frontal", hint: "Braços visíveis" },
  { key: "ponte", label: "Ponte", idealView: "lateral", hint: "Deitado, perfil para a câmera" },
  { key: "livre", label: "Movimento livre", idealView: "frontal", hint: "Corpo inteiro no quadro" },
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
      meanVisibility: 0,
      reasons: ["Nenhuma pessoa detectada"],
      message: "Posicione-se em frente à câmera",
    };
  }
  const key = KEY_LM.map((i) => lms[i]).filter(Boolean) as Landmark[];
  const meanVis =
    key.reduce((acc, p) => acc + (p.visibility ?? 0), 0) / Math.max(1, key.length);
  const visibilityOk = meanVis >= VISIBILITY_THRESHOLD;

  // Full body: nose + ankles visíveis dentro do frame (0..1)
  const nose = lms[LM.NOSE];
  const la = lms[LM.LEFT_ANKLE];
  const ra = lms[LM.RIGHT_ANKLE];
  const inFrame = (p?: Landmark) =>
    !!p && p.x >= 0.02 && p.x <= 0.98 && p.y >= 0.02 && p.y <= 0.98;
  const fullBody =
    inFrame(nose) &&
    inFrame(la) &&
    inFrame(ra) &&
    (nose?.visibility ?? 0) > 0.3 &&
    (la?.visibility ?? 0) > 0.3 &&
    (ra?.visibility ?? 0) > 0.3;

  // Distância: altura estimada nose->ankle
  const ankleY = Math.max(la?.y ?? 0, ra?.y ?? 0);
  const personHeight = ankleY - (nose?.y ?? 0);
  const distanceOk = personHeight >= 0.55 && personHeight <= 0.95;

  // Câmera nivelada: linha ombros ~ horizontal e linha quadris ~ horizontal
  const ls = lms[LM.LEFT_SHOULDER];
  const rs = lms[LM.RIGHT_SHOULDER];
  const lh = lms[LM.LEFT_HIP];
  const rh = lms[LM.RIGHT_HIP];
  const shTilt = ls && rs ? Math.abs(ls.y - rs.y) : 1;
  const hipTilt = lh && rh ? Math.abs(lh.y - rh.y) : 1;
  const cameraLevelOk = shTilt < 0.08 && hipTilt < 0.08;

  // Orientação: largura de ombros normalizada
  // frontal -> ombros bem separados; lateral -> ombros sobrepostos
  const shoulderWidth = ls && rs ? Math.hypot(ls.x - rs.x, ls.y - rs.y) : 0;
  const hipWidth = lh && rh ? Math.hypot(lh.x - rh.x, lh.y - rh.y) : 0;
  let orientationOk = false;
  if (orientation === "frontal") {
    orientationOk = shoulderWidth > 0.12 && hipWidth > 0.08;
  } else {
    orientationOk = shoulderWidth < 0.1 || hipWidth < 0.07;
  }

  const reasons: string[] = [];
  if (!fullBody) reasons.push("Corpo incompleto no quadro");
  if (!visibilityOk) reasons.push("Marcadores com baixa visibilidade");
  if (!distanceOk) {
    reasons.push(personHeight < 0.55 ? "Aproxime-se da câmera" : "Afaste-se da câmera");
  }
  if (!cameraLevelOk) reasons.push("Câmera inclinada — nivele o tripé/celular");
  if (!orientationOk)
    reasons.push(
      orientation === "frontal"
        ? "Posicione-se de frente para a câmera"
        : "Posicione-se de lado para a câmera",
    );

  const ok = fullBody && visibilityOk && orientationOk && cameraLevelOk && distanceOk;
  const message = ok ? "Enquadramento adequado" : reasons[0] ?? "Ajuste o enquadramento";

  return {
    ok,
    fullBody,
    visibilityOk,
    orientationOk,
    cameraLevelOk,
    distanceOk,
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

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
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
    setRecording(false);
    recordingRef.current = false;
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const drawOverlay = useCallback((lms: Landmark[] | null, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Silhueta-guia
    ctx.save();
    ctx.strokeStyle = "rgba(120,180,255,0.55)";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    const gx = w * 0.5;
    const gy = h * 0.5;
    const gw = w * 0.28;
    const gh = h * 0.82;
    ctx.strokeRect(gx - gw / 2, gy - gh / 2, gw, gh);
    ctx.setLineDash([]);
    ctx.restore();

    if (!lms) return;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(80,220,140,0.9)";
    ctx.fillStyle = "rgba(80,220,140,0.9)";
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
    for (const p of lms) {
      if (!p || (p.visibility ?? 1) < 0.3) continue;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!consentImageUse) {
      toast.error("Consentimento de uso de imagem necessário.");
      return;
    }
    setEngineError(null);
    setEngineLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Elemento de vídeo indisponível.");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      landmarkerRef.current = landmarker;
      setCameraOn(true);
      setEngineReady(true);

      const loop = () => {
        const v = videoRef.current;
        const lmr = landmarkerRef.current;
        if (!v || !lmr) return;
        if (v.readyState >= 2) {
          const ts = performance.now();
          const res = lmr.detectForVideo(v, ts);
          const lms: Landmark[] | null =
            res?.landmarks && res.landmarks.length > 0 ? (res.landmarks[0] as Landmark[]) : null;
          drawOverlay(lms, v.videoWidth || 1280, v.videoHeight || 720);
          const q = evaluateQuality(lms, orientationRef.current);
          setQuality(q);
          if (recordingRef.current && lms) {
            framesRef.current.push({
              t: ts - startedAtRef.current,
              lm: lms.map((p) => ({
                x: Math.round(p.x * 10000) / 10000,
                y: Math.round(p.y * 10000) / 10000,
                z: p.z !== undefined ? Math.round(p.z * 10000) / 10000 : undefined,
                v: p.visibility !== undefined ? Math.round(p.visibility * 100) / 100 : undefined,
              })),
            });
            setElapsedMs(ts - startedAtRef.current);
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao iniciar a câmera.";
      setEngineError(msg);
      toast.error(msg);
      stopCamera();
    } finally {
      setEngineLoading(false);
    }
  }, [consentImageUse, drawOverlay, stopCamera]);

  const startRecording = useCallback(() => {
    if (!engineReady) return;
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
  }, [engineReady]);

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

    // Gate agregado: exige % mínimo de frames com qualidade adequada.
    let goodFrames = 0;
    let visSum = 0;
    for (const f of frames) {
      const asLm: Landmark[] = f.lm.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
        visibility: p.v,
      }));
      const q = evaluateQuality(asLm, orientationRef.current);
      if (q.ok) goodFrames += 1;
      visSum += q.meanVisibility;
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
          .map((f) => {
            const asLm: Landmark[] = f.lm.map((p) => ({ x: p.x, y: p.y, z: p.z, visibility: p.v }));
            return sampleFromLandmarks(asLm, f.t / 1000);
          })
          .filter((s): s is NonNullable<typeof s> => !!s);
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar captura.");
    } finally {
      setSaving(false);
    }
  }, [assessmentId, patientId, clinicId, preset, quality, onSaved]);

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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Movimento avaliado</div>
            <Select
              value={preset.key}
              onValueChange={(v) => {
                const p = PRESETS.find((x) => x.key === v) ?? PRESETS[0];
                setPreset(p);
                setOrientation(p.idealView);
              }}
              disabled={cameraOn && recording}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
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
              onValueChange={(v) => setOrientation(v as Orientation)}
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
              Ideal para este movimento: {preset.idealView === "frontal" ? "Frontal" : "Lateral"}
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
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
          />
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
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <Badge
                variant={quality?.ok ? "default" : "secondary"}
                className={
                  quality?.ok
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-100 border-amber-500/40"
                }
              >
                {quality?.ok ? (
                  <CircleCheck className="mr-1 h-3 w-3" />
                ) : (
                  <CircleAlert className="mr-1 h-3 w-3" />
                )}
                {quality?.message ?? "Aguardando detecção…"}
              </Badge>
              {recording && (
                <Badge className="border-red-500/50 bg-red-500/20 text-red-100">
                  ● REC {(elapsedMs / 1000).toFixed(1)}s
                </Badge>
              )}
            </div>
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
            {Math.round(VISIBILITY_THRESHOLD * 100)}%
          </div>
          <div className="flex items-center gap-2">
            {!recording ? (
              <Button
                variant="hero"
                size="sm"
                onClick={startRecording}
                disabled={!quality?.ok || countdown !== null || saving}
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
