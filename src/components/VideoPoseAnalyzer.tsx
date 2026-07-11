import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSignedMediaUrl } from "@/lib/mediaStorage";
import {
  POSE_CONNECTIONS,
  sampleFromLandmarks,
  summarizeSamples,
  toJson,
  type AnalysisContext,
  type AutoMetricsSummary,
  type FrameSample,
  type Landmark,
  type RepMetrics,
} from "@/lib/poseMetrics";

interface Props {
  resultId: string;
  videoPath: string;
  table?: "movement_results" | "exercise_results";
  context?: AnalysisContext;
  initialSummary?: AutoMetricsSummary | null;
  onSaved?: () => void;
}

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const TARGET_FPS = 8;

export function VideoPoseAnalyzer({
  resultId,
  videoPath,
  table = "movement_results",
  context = "squat",
  initialSummary,
  onSaved,
}: Props) {
  const { url, loading: urlLoading, error: urlError } = useSignedMediaUrl(videoPath);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<AutoMetricsSummary | null>(initialSummary ?? null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [samples, setSamples] = useState<FrameSample[]>([]);

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

    let landmarker: { detectForVideo: (v: HTMLVideoElement, t: number) => { landmarks?: Landmark[][] }; close: () => void } | null = null;
    try {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      }) as unknown as typeof landmarker;

      if (video.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          const onLoaded = () => { video.removeEventListener("loadedmetadata", onLoaded); resolve(); };
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
      const collected: FrameSample[] = [];
      let t = 0;

      while (t <= duration) {
        await seekTo(video, t);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Timestamp coerente com o tempo do vídeo (ms), monotônico.
        const tsMs = Math.round(video.currentTime * 1000);
        const result = landmarker!.detectForVideo(video, tsMs);
        const first = result.landmarks?.[0];
        if (first && first.length >= 29) {
          drawSkeleton(ctx, first, canvas.width, canvas.height);
          const sample = sampleFromLandmarks(first, video.currentTime);
          if (sample) collected.push(sample);
        }
        t += step;
        setProgress(Math.min(100, Math.round((t / duration) * 100)));
      }

      if (collected.length === 0) {
        await supabase.from(table).update({ analysis_status: "error" }).eq("id", resultId);
        setEngineError("Nenhum marcador foi detectado no vídeo. Refaça a captura com melhor iluminação e enquadramento de corpo inteiro.");
        toast.error("Análise não detectou marcadores.");
        return;
      }

      const built = summarizeSamples(collected, duration, context);
      const { error } = await supabase
        .from(table)
        .update({ metrics: toJson(built), analysis_status: "done" })
        .eq("id", resultId);
      if (error) throw new Error(error.message);

      setSamples(collected);
      setSummary(built);
      toast.success("Análise concluída.");
      onSaved?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setEngineError(msg);
      await supabase.from(table).update({ analysis_status: "error" }).eq("id", resultId).then(() => undefined);
      toast.error("Falha ao analisar vídeo.");
    } finally {
      try { landmarker?.close(); } catch { /* ignore */ }
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Análise biomecânica automática</span>
          <Badge variant="outline" className="text-[10px]">estimativa 2D — apoio à decisão</Badge>
        </div>
        <Button size="sm" onClick={runAnalysis} disabled={running || urlLoading || !url} variant="hero">
          {running ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando… {progress}%</>) : summary ? "Reanalisar vídeo" : "Analisar vídeo"}
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
          <video ref={videoRef} src={url} crossOrigin="anonymous" playsInline muted preload="auto"
            className="block max-h-[420px] w-full opacity-0"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        )}
        <canvas ref={canvasRef} className="block h-auto w-full" />
        {!summary && !running && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Clique em “Analisar vídeo” para gerar o esqueleto sobreposto.
          </div>
        )}
      </div>

      {summary && <SummaryPanel summary={summary} samples={samples} />}

      <p className="text-[11px] text-muted-foreground">
        Estimativa automática 2D — apoio à decisão. Requer confirmação profissional. Não é diagnóstico.
      </p>
    </div>
  );
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
    video.addEventListener("seeked", onSeeked, { once: true });
    try { video.currentTime = Math.min(t, video.duration || t); } catch { resolve(); }
  });
}

function drawSkeleton(ctx: CanvasRenderingContext2D, lms: Landmark[], w: number, h: number) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
  ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
  for (const [a, b] of POSE_CONNECTIONS) {
    const pa = lms[a]; const pb = lms[b];
    if (!pa || !pb) continue;
    ctx.beginPath(); ctx.moveTo(pa.x * w, pa.y * h); ctx.lineTo(pb.x * w, pb.y * h); ctx.stroke();
  }
  for (const p of lms) {
    if (!p) continue;
    ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2); ctx.fill();
  }
}

function SummaryPanel({ summary, samples }: { summary: AutoMetricsSummary; samples: FrameSample[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const s = summary.summary_stats;
  const cards: Array<{ label: string; value: string; sub?: string }> = [
    { label: "Repetições válidas", value: `${summary.reps_valid}/${summary.reps_total}` },
    { label: "Amplitude mediana D", value: `${fmtDeg(s.knee_flexion_range_right_deg.median)}`, sub: `P5–P95: ${fmtDeg(s.knee_flexion_range_right_deg.p5)} – ${fmtDeg(s.knee_flexion_range_right_deg.p95)}` },
    { label: "Amplitude mediana E", value: `${fmtDeg(s.knee_flexion_range_left_deg.median)}`, sub: `P5–P95: ${fmtDeg(s.knee_flexion_range_left_deg.p5)} – ${fmtDeg(s.knee_flexion_range_left_deg.p95)}` },
    { label: "Tempo mediano/rep", value: `${s.rep_duration_s.median.toFixed(2)}s` },
    { label: "Simetria bilateral mediana", value: `${Math.round(s.bilateral_symmetry.median * 100)}%` },
    { label: "Inclinação de tronco P95", value: `${fmtDeg(s.trunk_inclination_p95_deg.median)}` },
    { label: "Deslocamento frontal D P95", value: `${s.knee_frontal_deviation_right_p95.median.toFixed(3)}`, sub: "estimativa 2D — não é diagnóstico de valgo" },
    { label: "Deslocamento frontal E P95", value: `${s.knee_frontal_deviation_left_p95.median.toFixed(3)}`, sub: "estimativa 2D — não é diagnóstico de valgo" },
    { label: "Confiança (melhor / pior)", value: `${Math.round(s.confidence.best * 100)}% / ${Math.round(s.confidence.worst * 100)}%` },
    { label: "Consistência entre repetições", value: `${Math.round(s.consistency * 100)}%` },
    { label: "Frames válidos", value: `${summary.frames_valid}/${summary.frames_analyzed} (${Math.round(summary.valid_frame_ratio * 100)}%)` },
    { label: "Duração analisada", value: `${summary.duration_seconds.toFixed(1)}s` },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md border border-border/40 bg-card/40 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.label}</div>
            <div className="text-sm font-medium">{c.value}</div>
            {c.sub && <div className="text-[10px] text-muted-foreground/80">{c.sub}</div>}
          </div>
        ))}
      </div>

      {samples.length > 0 && <TimelineChart samples={samples} reps={summary.reps} />}

      {summary.reps.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Repetições</div>
          <ul className="space-y-1">
            {summary.reps.map((r) => (
              <li key={r.index} className="rounded-md border border-border/40 bg-card/40">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === r.index ? null : r.index)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Badge variant={r.valid ? "default" : "secondary"} className="text-[10px]">
                      #{r.index} {r.valid ? "válida" : "atenção"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {r.duration_s.toFixed(2)}s · amp D {fmtDeg(r.knee_flexion_range_right_deg)} · amp E {fmtDeg(r.knee_flexion_range_left_deg)}
                    </span>
                  </span>
                  {expanded === r.index ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {expanded === r.index && (
                  <div className="grid gap-1 border-t border-border/40 px-3 py-2 text-[11px] text-muted-foreground sm:grid-cols-2">
                    <div>Descida: {r.descent_s.toFixed(2)}s · Subida: {r.ascent_s.toFixed(2)}s</div>
                    <div>Tronco P95: {fmtDeg(r.trunk_inclination_p95_deg)}</div>
                    <div>Desloc. frontal D P95: {r.knee_frontal_deviation_right_p95.toFixed(3)}</div>
                    <div>Desloc. frontal E P95: {r.knee_frontal_deviation_left_p95.toFixed(3)}</div>
                    <div>Simetria: {Math.round(r.bilateral_symmetry * 100)}%</div>
                    <div>Confiança: {Math.round(r.confidence * 100)}%</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.suggestions.length > 0 && (
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            Sugestões (editáveis pelo profissional)
          </div>
          <ul className="space-y-1">
            {summary.suggestions.map((sug, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {sug}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineChart({ samples, reps }: { samples: FrameSample[]; reps: RepMetrics[] }) {
  const W = 640, H = 160, PAD = 24;
  const times = samples.map((s) => s.t);
  const tMin = times[0] ?? 0;
  const tMax = times[times.length - 1] ?? 1;
  const dt = Math.max(1e-6, tMax - tMin);
  const kneeL = samples.map((s) => 180 - (Number.isFinite(s.kneeAngleL) ? s.kneeAngleL : 180));
  const kneeR = samples.map((s) => 180 - (Number.isFinite(s.kneeAngleR) ? s.kneeAngleR : 180));
  const allY = [...kneeL, ...kneeR].filter(Number.isFinite);
  const yMin = allY.length ? Math.min(...allY) : 0;
  const yMax = allY.length ? Math.max(...allY) : 1;
  const dy = Math.max(1, yMax - yMin);
  const xOf = (t: number) => PAD + ((t - tMin) / dt) * (W - 2 * PAD);
  const yOf = (v: number) => H - PAD - ((v - yMin) / dy) * (H - 2 * PAD);
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(times[i]).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");

  return (
    <div className="overflow-hidden rounded-md border border-border/40 bg-card/30 p-2">
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Flexão de joelho ao longo do tempo (graus)</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="inline-block h-1 w-3 bg-sky-400" /> D</span>
          <span className="flex items-center gap-1"><span className="inline-block h-1 w-3 bg-emerald-400" /> E</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full">
        <rect x={0} y={0} width={W} height={H} fill="transparent" />
        {/* eixos */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" strokeOpacity={0.2} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="currentColor" strokeOpacity={0.2} />
        <path d={path(kneeR)} stroke="rgb(56 189 248)" strokeWidth={1.5} fill="none" />
        <path d={path(kneeL)} stroke="rgb(52 211 153)" strokeWidth={1.5} fill="none" />
        {/* faixas leves indicando repetições detectadas */}
        {reps.map((r) => {
          const s = samples[r.index - 1];
          if (!s) return null;
          const x = xOf(s.t);
          return <line key={r.index} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />;
        })}
      </svg>
    </div>
  );
}

function fmtDeg(v: number): string {
  return Number.isFinite(v) ? `${Math.round(v)}°` : "—";
}
