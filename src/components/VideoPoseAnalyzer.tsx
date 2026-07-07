import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSignedMediaUrl } from "@/lib/mediaStorage";
import {
  POSE_CONNECTIONS,
  sampleFromLandmarks,
  summarizeSamples,
  toJson,
  type AutoMetricsSummary,
  type FrameSample,
  type Landmark,
} from "@/lib/poseMetrics";

interface Props {
  movementResultId: string;
  videoPath: string;
  initialSummary?: AutoMetricsSummary | null;
  onSaved?: () => void;
}

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const TARGET_FPS = 8;

export function VideoPoseAnalyzer({ movementResultId, videoPath, initialSummary, onSaved }: Props) {
  const { url, loading: urlLoading, error: urlError } = useSignedMediaUrl(videoPath);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<AutoMetricsSummary | null>(initialSummary ?? null);
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    setSummary(initialSummary ?? null);
  }, [initialSummary]);

  async function runAnalysis() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !url) return;
    setEngineError(null);
    setRunning(true);
    setProgress(0);

    try {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      // Garante metadados carregados.
      if (video.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          const onErr = () => reject(new Error("Falha ao carregar vídeo."));
          video.addEventListener("loadedmetadata", onLoaded, { once: true });
          video.addEventListener("error", onErr, { once: true });
        });
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration || duration <= 0) throw new Error("Duração do vídeo inválida.");

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível.");

      const step = 1 / TARGET_FPS;
      const samples: FrameSample[] = [];
      let t = 0;

      while (t <= duration) {
        await seekTo(video, t);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const result = landmarker.detectForVideo(video, performance.now());
        const first = result.landmarks?.[0] as Landmark[] | undefined;
        if (first && first.length >= 29) {
          drawSkeleton(ctx, first, canvas.width, canvas.height);
          const sample = sampleFromLandmarks(first);
          if (sample) samples.push(sample);
        }
        t += step;
        setProgress(Math.min(100, Math.round((t / duration) * 100)));
      }

      landmarker.close();

      if (samples.length === 0) {
        await supabase
          .from("movement_results")
          .update({ analysis_status: "error" })
          .eq("id", movementResultId);
        setEngineError(
          "Nenhum marcador foi detectado no vídeo. Tente uma nova captura com melhor iluminação e enquadramento de corpo inteiro.",
        );
        toast.error("Análise não detectou marcadores.");
        return;
      }

      const built = summarizeSamples(samples, duration);
      const { error } = await supabase
        .from("movement_results")
        .update({ metrics: toJson(built), analysis_status: "done" })
        .eq("id", movementResultId);
      if (error) throw new Error(error.message);

      setSummary(built);
      toast.success("Análise concluída.");
      onSaved?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setEngineError(msg);
      await supabase
        .from("movement_results")
        .update({ analysis_status: "error" })
        .eq("id", movementResultId)
        .then(() => undefined);
      toast.error("Falha ao analisar vídeo.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Análise biomecânica automática</span>
          <Badge variant="outline" className="text-[10px]">
            estimativa — apoio à decisão
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={runAnalysis}
          disabled={running || urlLoading || !url}
          variant="hero"
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando… {progress}%
            </>
          ) : summary ? (
            "Reanalisar vídeo"
          ) : (
            "Analisar vídeo (estimativa automática)"
          )}
        </Button>
      </div>

      {urlError && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4" /> Não foi possível carregar o vídeo para análise.
        </div>
      )}
      {engineError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{engineError}</span>
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-lg border border-border/60 bg-black">
        {url && (
          <video
            ref={videoRef}
            src={url}
            crossOrigin="anonymous"
            playsInline
            muted
            preload="auto"
            className="block max-h-[420px] w-full opacity-0"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
        )}
        <canvas ref={canvasRef} className="block h-auto w-full" />
        {!summary && !running && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Clique em “Analisar vídeo” para gerar o esqueleto sobreposto.
          </div>
        )}
      </div>

      {summary && <AutoMetricsPanel summary={summary} />}

      <p className="text-[11px] text-muted-foreground">
        Estimativa automática — apoio à decisão. Requer confirmação clínica. Não é diagnóstico.
      </p>
    </div>
  );
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    try {
      video.currentTime = Math.min(t, video.duration || t);
    } catch {
      resolve();
    }
  });
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  lms: Landmark[],
  w: number,
  h: number,
) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
  ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = lms[a];
    const pb = lms[b];
    if (!pa || !pb) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * w, pa.y * h);
    ctx.lineTo(pb.x * w, pb.y * h);
    ctx.stroke();
  }
  for (const p of lms) {
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function AutoMetricsPanel({ summary }: { summary: AutoMetricsSummary }) {
  const rows: Array<{ label: string; value: string }> = [
    {
      label: "Flexão de joelho D (min / max / amplitude)",
      value: `${fmt(summary.knee_flexion.right.min_deg)}° / ${fmt(summary.knee_flexion.right.max_deg)}° / ${fmt(summary.knee_flexion.right.range_deg)}°`,
    },
    {
      label: "Flexão de joelho E (min / max / amplitude)",
      value: `${fmt(summary.knee_flexion.left.min_deg)}° / ${fmt(summary.knee_flexion.left.max_deg)}° / ${fmt(summary.knee_flexion.left.range_deg)}°`,
    },
    {
      label: "Desvio frontal máx. joelho D",
      value: `${summary.knee_frontal_deviation.right_max_abs}`,
    },
    {
      label: "Desvio frontal máx. joelho E",
      value: `${summary.knee_frontal_deviation.left_max_abs}`,
    },
    {
      label: "Inclinação de tronco (média / máx.)",
      value: `${fmt(summary.trunk_inclination.mean_deg)}° / ${fmt(summary.trunk_inclination.max_deg)}°`,
    },
    {
      label: "Amplitude vertical do quadril",
      value: `${summary.hip_vertical_amplitude.normalized}`,
    },
    {
      label: "Índice de simetria D/E",
      value: `${summary.symmetry_index}/100`,
    },
    {
      label: "Frames analisados",
      value: `${summary.frames_analyzed} (${summary.duration_seconds}s)`,
    },
    {
      label: "Confiança média dos marcadores",
      value: `${Math.round(summary.mean_confidence * 100)}%`,
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="rounded-md border border-border/40 bg-card/40 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
            <div className="text-sm font-medium">{r.value}</div>
          </div>
        ))}
      </div>
      {summary.suggestions.length > 0 && (
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            Sugestões (editáveis pelo profissional)
          </div>
          <ul className="space-y-1">
            {summary.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function fmt(v: number): string {
  return Number.isFinite(v) ? String(v) : "—";
}