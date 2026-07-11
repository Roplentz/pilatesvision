/**
 * Runner de validação (uso interno) — QEVD-FIT-COACH-Benchmark.
 *
 * Reutiliza o Motor Biomecânico MVP v1 exatamente como está em produção:
 * importa `sampleFromLandmarks` e `summarizeSamples` de `src/lib/poseMetrics.ts`
 * (mesmas versões de detector, filtro e limiares). Landmarks são extraídos
 * previamente pelo script Python `extract_landmarks.py` usando
 * MediaPipe Tasks PoseLandmarker Lite 0.10.35, o mesmo modelo referenciado
 * por `ENGINE_VERSION` (`tasks-vision-0.10.35/lite`).
 *
 * Não altera thresholds. Não faz upload. Não persiste vídeos.
 * Uso: bun run scripts/research/qevd/run_metrics.ts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  sampleFromLandmarks,
  summarizeSamples,
  ENGINE_VERSION,
  SCHEMA_VERSION,
  type Landmark,
} from "../../../src/lib/poseMetrics";

type PlanRow = {
  sample_id: string;
  video: string;
  exercise: string;
  category: "regular" | "variacao" | "qualidade_reduzida" | "nao_agachamento";
  start: number;
  end: number;
  ref_reps: number | null;
  ref_note: string;
};

type FrameRecord = { t: number; landmarks: Landmark[] };
type LandmarkFile = {
  sample_id: string;
  video: string;
  start_s: number;
  end_s: number;
  fps: number;
  frames: FrameRecord[];
};

const LANDMARK_DIR = process.env.QEVD_LANDMARK_DIR ?? "/tmp/qevd/landmarks";
const PLAN_PATH = process.env.QEVD_PLAN ?? "/tmp/qevd/samples_plan.json";
const OUT_DIR = process.env.QEVD_OUT_DIR ?? "/tmp/qevd/out";

mkdirSync(OUT_DIR, { recursive: true });

const plan: PlanRow[] = JSON.parse(readFileSync(PLAN_PATH, "utf8"));
const planById = new Map(plan.map((p) => [p.sample_id, p]));

type Row = {
  sample_id: string;
  video_id: string;
  start_s: number;
  end_s: number;
  category: PlanRow["category"];
  exercise_ref: string;
  ref_reps: number | null;
  ref_note: string;
  frames_total: number;
  frames_valid: number;
  valid_ratio: number;
  mean_confidence: number;
  reps_detected: number;
  reps_valid: number;
  median_knee_range_left: number;
  median_knee_range_right: number;
  median_trunk_p95: number;
  median_bilateral_symmetry: number;
  consistency: number;
  abs_error: number | null;
  false_positive: boolean;
  false_negative: boolean;
  rejected: boolean;
  rejection_reason: string;
};

const results: Row[] = [];
const raw: Record<string, unknown> = {};

const files = readdirSync(LANDMARK_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

for (const file of files) {
  const data: LandmarkFile = JSON.parse(
    readFileSync(join(LANDMARK_DIR, file), "utf8"),
  );
  const plan = planById.get(data.sample_id);
  if (!plan) continue;

  const samples = data.frames
    .map((f) => (f.landmarks.length > 0 ? sampleFromLandmarks(f.landmarks, f.t) : null))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const summary = summarizeSamples(samples, data.end_s - data.start_s, "squat");
  raw[data.sample_id] = summary;

  const isSquatFamily = plan.category !== "nao_agachamento";
  const rejected = summary.reps_valid < 1;
  const rejection_reason = rejected
    ? summary.mean_confidence < 0.4
      ? "confiança média < 0.4"
      : summary.frames_valid / Math.max(1, summary.frames_analyzed) < 0.5
        ? "taxa de frames válidos < 0.5"
        : "nenhuma repetição válida detectada"
    : "";

  const abs_error =
    plan.ref_reps == null ? null : Math.abs(summary.reps_valid - plan.ref_reps);

  const false_positive = !isSquatFamily && summary.reps_valid > 0;
  const false_negative = isSquatFamily && summary.reps_valid === 0;

  results.push({
    sample_id: plan.sample_id,
    video_id: plan.video,
    start_s: plan.start,
    end_s: plan.end,
    category: plan.category,
    exercise_ref: plan.exercise,
    ref_reps: plan.ref_reps,
    ref_note: plan.ref_note,
    frames_total: summary.frames_analyzed,
    frames_valid: summary.frames_valid,
    valid_ratio: summary.valid_frame_ratio,
    mean_confidence: summary.mean_confidence,
    reps_detected: summary.reps_total,
    reps_valid: summary.reps_valid,
    median_knee_range_left:
      summary.summary_stats.knee_flexion_range_left_deg.median,
    median_knee_range_right:
      summary.summary_stats.knee_flexion_range_right_deg.median,
    median_trunk_p95: summary.summary_stats.trunk_inclination_p95_deg.median,
    median_bilateral_symmetry: summary.summary_stats.bilateral_symmetry.median,
    consistency: summary.summary_stats.consistency,
    abs_error,
    false_positive,
    false_negative,
    rejected,
    rejection_reason,
  });
}

writeFileSync(
  join(OUT_DIR, "results.json"),
  JSON.stringify({ engine_version: ENGINE_VERSION, schema: SCHEMA_VERSION, rows: results, raw }, null, 2),
);

const header = [
  "sample_id","video_id","start_s","end_s","category","exercise_ref",
  "ref_reps","frames_total","frames_valid","valid_ratio","mean_confidence",
  "reps_detected","reps_valid","median_knee_range_left","median_knee_range_right",
  "median_trunk_p95","median_bilateral_symmetry","consistency","abs_error",
  "false_positive","false_negative","rejected","rejection_reason",
];
const csv = [header.join(",")];
for (const r of results) {
  csv.push(header.map((h) => {
    const v = (r as Record<string, unknown>)[h];
    if (v == null) return "";
    if (typeof v === "string") return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    return String(v);
  }).join(","));
}
writeFileSync(join(OUT_DIR, "results.csv"), csv.join("\n") + "\n");

console.log(`wrote ${results.length} rows to ${OUT_DIR}/results.{json,csv}`);
for (const r of results) {
  console.log(
    `${r.sample_id} ${r.category.padEnd(18)} reps_valid=${r.reps_valid} ref=${r.ref_reps ?? "-"} conf=${r.mean_confidence} valid_ratio=${r.valid_ratio} rejected=${r.rejected}`,
  );
}