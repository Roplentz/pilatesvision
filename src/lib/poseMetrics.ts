import type { Json } from "@/integrations/supabase/types";

// Índices MediaPipe Pose (33 landmarks)
export const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// Conexões do esqueleto (subset relevante para MMII/tronco).
export const POSE_CONNECTIONS: Array<[number, number]> = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.hypot(v1x, v1y);
  const m2 = Math.hypot(v2x, v2y);
  if (m1 === 0 || m2 === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Desvio horizontal (frontal) do joelho em relação à linha quadril-tornozelo.
// Normalizado pela largura entre quadris (proxy para escala do sujeito).
function kneeFrontalDeviation(hip: Landmark, knee: Landmark, ankle: Landmark, hipWidth: number): number {
  if (hipWidth <= 0) return NaN;
  // interpolação da linha quadril-tornozelo na altura do joelho (em y).
  const dy = ankle.y - hip.y;
  if (Math.abs(dy) < 1e-6) return NaN;
  const t = (knee.y - hip.y) / dy;
  const expectedX = hip.x + t * (ankle.x - hip.x);
  return (knee.x - expectedX) / hipWidth; // positivo = joelho mais lateral que a linha, sinal depende do lado
}

function trunkInclination(shoulders: Landmark, hips: Landmark): number {
  const dx = shoulders.x - hips.x;
  const dy = shoulders.y - hips.y;
  // Ângulo em relação à vertical (0 = alinhado, cresce conforme inclina).
  const rad = Math.atan2(Math.abs(dx), Math.abs(dy));
  return (rad * 180) / Math.PI;
}

export interface FrameSample {
  kneeAngleL: number;
  kneeAngleR: number;
  kneeValgusL: number; // desvio frontal do joelho E (subject left)
  kneeValgusR: number; // desvio frontal do joelho D
  trunkInclination: number;
  hipMidY: number;
  meanVisibility: number;
}

export function sampleFromLandmarks(lms: Landmark[]): FrameSample | null {
  if (!lms || lms.length < 29) return null;
  const ls = lms[LM.LEFT_SHOULDER];
  const rs = lms[LM.RIGHT_SHOULDER];
  const lh = lms[LM.LEFT_HIP];
  const rh = lms[LM.RIGHT_HIP];
  const lk = lms[LM.LEFT_KNEE];
  const rk = lms[LM.RIGHT_KNEE];
  const la = lms[LM.LEFT_ANKLE];
  const ra = lms[LM.RIGHT_ANKLE];
  if (!ls || !rs || !lh || !rh || !lk || !rk || !la || !ra) return null;

  const shouldersMid: Landmark = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipsMid: Landmark = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const hipWidth = Math.hypot(lh.x - rh.x, lh.y - rh.y);

  const kneeAngleL = angleDeg(lh, lk, la);
  const kneeAngleR = angleDeg(rh, rk, ra);
  const kneeValgusL = kneeFrontalDeviation(lh, lk, la, hipWidth);
  const kneeValgusR = kneeFrontalDeviation(rh, rk, ra, hipWidth);
  const trunk = trunkInclination(shouldersMid, hipsMid);

  const keyPoints = [ls, rs, lh, rh, lk, rk, la, ra];
  const vis = keyPoints.reduce((acc, p) => acc + (p.visibility ?? 1), 0) / keyPoints.length;

  return {
    kneeAngleL,
    kneeAngleR,
    kneeValgusL,
    kneeValgusR,
    trunkInclination: trunk,
    hipMidY: hipsMid.y,
    meanVisibility: vis,
  };
}

export interface AutoMetricsSummary {
  engine: "mediapipe-pose-landmarker";
  engine_version: string;
  frames_analyzed: number;
  duration_seconds: number;
  mean_confidence: number;
  knee_flexion: {
    left: { min_deg: number; max_deg: number; range_deg: number };
    right: { min_deg: number; max_deg: number; range_deg: number };
  };
  knee_frontal_deviation: {
    left_max_abs: number;
    right_max_abs: number;
    note: string;
  };
  trunk_inclination: { max_deg: number; mean_deg: number };
  hip_vertical_amplitude: { normalized: number; note: string };
  symmetry_index: number; // 0-100
  suggestions: string[];
  disclaimer: string;
  generated_at: string;
}

function stats(values: number[]) {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return { min: NaN, max: NaN, mean: NaN };
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  return { min, max, mean };
}

export function summarizeSamples(samples: FrameSample[], durationSeconds: number): AutoMetricsSummary {
  const kneeL = stats(samples.map((s) => s.kneeAngleL));
  const kneeR = stats(samples.map((s) => s.kneeAngleR));
  const trunk = stats(samples.map((s) => s.trunkInclination));
  const hipY = stats(samples.map((s) => s.hipMidY));
  const valgusL = Math.max(0, ...samples.map((s) => Math.abs(s.kneeValgusL)).filter(Number.isFinite));
  const valgusR = Math.max(0, ...samples.map((s) => Math.abs(s.kneeValgusR)).filter(Number.isFinite));
  const conf = stats(samples.map((s) => s.meanVisibility));

  const rangeL = Number.isFinite(kneeL.max - kneeL.min) ? kneeL.max - kneeL.min : 0;
  const rangeR = Number.isFinite(kneeR.max - kneeR.min) ? kneeR.max - kneeR.min : 0;
  const symmetryDenom = Math.max(rangeL, rangeR, 1);
  const symmetry = Math.round(100 * (1 - Math.abs(rangeL - rangeR) / symmetryDenom));

  const hipAmp = Number.isFinite(hipY.max - hipY.min) ? hipY.max - hipY.min : 0;

  const suggestions: string[] = [];
  if (valgusR > 0.15) suggestions.push("Possível valgo dinâmico à direita — sugere-se confirmação clínica.");
  if (valgusL > 0.15) suggestions.push("Possível valgo dinâmico à esquerda — sugere-se confirmação clínica.");
  if (Math.abs(rangeL - rangeR) > 12) suggestions.push("Assimetria de amplitude de flexão de joelho — sugere-se avaliação bilateral.");
  if (trunk.max > 45) suggestions.push("Inclinação de tronco acentuada — sugere-se avaliar controle de tronco e quadril.");
  if (conf.mean < 0.5) suggestions.push("Baixa visibilidade dos marcadores — recomenda-se nova captura com melhor enquadramento.");

  return {
    engine: "mediapipe-pose-landmarker",
    engine_version: "lite-v0.1",
    frames_analyzed: samples.length,
    duration_seconds: Math.round(durationSeconds * 10) / 10,
    mean_confidence: Math.round((conf.mean || 0) * 100) / 100,
    knee_flexion: {
      left: {
        min_deg: Math.round(kneeL.min),
        max_deg: Math.round(kneeL.max),
        range_deg: Math.round(rangeL),
      },
      right: {
        min_deg: Math.round(kneeR.min),
        max_deg: Math.round(kneeR.max),
        range_deg: Math.round(rangeR),
      },
    },
    knee_frontal_deviation: {
      left_max_abs: Math.round(valgusL * 100) / 100,
      right_max_abs: Math.round(valgusR * 100) / 100,
      note: "Desvio frontal do joelho em relação à linha quadril-tornozelo, normalizado pela largura pélvica. Estimativa 2D.",
    },
    trunk_inclination: {
      max_deg: Math.round(trunk.max),
      mean_deg: Math.round(trunk.mean),
    },
    hip_vertical_amplitude: {
      normalized: Math.round(hipAmp * 1000) / 1000,
      note: "Deslocamento vertical do quadril em coordenadas normalizadas do frame.",
    },
    symmetry_index: Number.isFinite(symmetry) ? symmetry : 0,
    suggestions,
    disclaimer:
      "Estimativa automática — apoio à decisão. Requer confirmação clínica. Não é diagnóstico.",
    generated_at: new Date().toISOString(),
  };
}

export function isAutoMetricsSummary(value: unknown): value is AutoMetricsSummary {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.engine === "mediapipe-pose-landmarker" && typeof v.frames_analyzed === "number";
}

export function toJson(summary: AutoMetricsSummary): Json {
  return summary as unknown as Json;
}