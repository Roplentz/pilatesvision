import type { Json } from "@/integrations/supabase/types";

// ---------------------------------------------------------------------------
// PilatesVision · Motor Biomecânico MVP v1
// Estimativa 2D de pose (MediaPipe) — apoio à decisão. Não é diagnóstico.
// ---------------------------------------------------------------------------

export const SCHEMA_VERSION = "biomechanics-mvp-v1";
export const ENGINE = "mediapipe-pose-landmarker";
export const ENGINE_VERSION = "tasks-vision-0.10.35/lite";

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

// ---------------------------------------------------------------------------
// Utilitários numéricos determinísticos (sem dependência externa).
// ---------------------------------------------------------------------------

/** Sanitiza número: substitui NaN/Infinity por fallback. */
export function safeNum(v: number, fallback = 0): number {
  return Number.isFinite(v) ? v : fallback;
}

/** Arredonda com casas decimais preservando finitude. */
export function round(v: number, decimals = 2): number {
  if (!Number.isFinite(v)) return 0;
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}

function cleanFinite(values: number[]): number[] {
  return values.filter((v) => Number.isFinite(v));
}

export function median(values: number[]): number {
  const arr = cleanFinite(values).sort((a, b) => a - b);
  if (arr.length === 0) return NaN;
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
}

/** Percentil por interpolação linear (0..100). */
export function percentile(values: number[], p: number): number {
  const arr = cleanFinite(values).sort((a, b) => a - b);
  if (arr.length === 0) return NaN;
  if (arr.length === 1) return arr[0];
  const rank = (p / 100) * (arr.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return arr[lo];
  return arr[lo] + (arr[hi] - arr[lo]) * (rank - lo);
}

export function mean(values: number[]): number {
  const arr = cleanFinite(values);
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stdev(values: number[]): number {
  const arr = cleanFinite(values);
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = arr.reduce((acc, x) => acc + (x - m) * (x - m), 0) / (arr.length - 1);
  return Math.sqrt(v);
}

/**
 * Suavização temporal por EMA simétrica (forward+backward) — zero-fase,
 * determinística e sem dependências. Alpha 0..1 controla a resposta.
 */
export function emaSmoothZeroPhase(values: number[], alpha = 0.3): number[] {
  if (values.length === 0) return [];
  const fwd = new Array<number>(values.length);
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    const v = Number.isFinite(values[i]) ? values[i] : prev;
    prev = alpha * v + (1 - alpha) * prev;
    fwd[i] = prev;
  }
  const out = new Array<number>(values.length);
  prev = fwd[fwd.length - 1];
  for (let i = fwd.length - 1; i >= 0; i--) {
    prev = alpha * fwd[i] + (1 - alpha) * prev;
    out[i] = prev;
  }
  return out;
}

/**
 * Interpola pontos inválidos (NaN) linearmente entre vizinhos válidos.
 * Extremos: repetem o valor válido mais próximo.
 */
export function interpolateInvalid(values: number[]): number[] {
  const out = values.slice();
  const n = out.length;
  if (n === 0) return out;
  // Extremidade inicial
  let firstValid = -1;
  for (let i = 0; i < n; i++)
    if (Number.isFinite(out[i])) {
      firstValid = i;
      break;
    }
  if (firstValid === -1) return out.map(() => NaN);
  for (let i = 0; i < firstValid; i++) out[i] = out[firstValid];
  // Interior
  let i = firstValid;
  while (i < n) {
    if (!Number.isFinite(out[i])) {
      let j = i;
      while (j < n && !Number.isFinite(out[j])) j++;
      if (j >= n) {
        for (let k = i; k < n; k++) out[k] = out[i - 1];
        break;
      }
      const a = out[i - 1];
      const b = out[j];
      const span = j - (i - 1);
      for (let k = i; k < j; k++) {
        out[k] = a + ((b - a) * (k - (i - 1))) / span;
      }
      i = j;
    } else i++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Geometria
// ---------------------------------------------------------------------------

function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const v1x = a.x - b.x,
    v1y = a.y - b.y;
  const v2x = c.x - b.x,
    v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.hypot(v1x, v1y);
  const m2 = Math.hypot(v2x, v2y);
  if (m1 === 0 || m2 === 0) return NaN;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function frontalDeviation(
  hip: Landmark,
  knee: Landmark,
  ankle: Landmark,
  hipWidth: number,
): number {
  if (hipWidth <= 0) return NaN;
  const dy = ankle.y - hip.y;
  if (Math.abs(dy) < 1e-6) return NaN;
  const t = (knee.y - hip.y) / dy;
  const expectedX = hip.x + t * (ankle.x - hip.x);
  return (knee.x - expectedX) / hipWidth;
}

function trunkInclinationDeg(shoulders: Landmark, hips: Landmark): number {
  const dx = shoulders.x - hips.x;
  const dy = shoulders.y - hips.y;
  const rad = Math.atan2(Math.abs(dx), Math.abs(dy));
  return (rad * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
// Amostragem por frame
// ---------------------------------------------------------------------------

export interface FrameSample {
  /** Tempo do quadro em segundos (relativo ao início da série). */
  t: number;
  kneeAngleL: number;
  kneeAngleR: number;
  kneeValgusL: number; // preservado por compatibilidade — desvio frontal aparente do joelho E
  kneeValgusR: number; // idem para o joelho D
  trunkInclination: number;
  hipMidY: number;
  meanVisibility: number;
  valid: boolean;
  /**
   * Ângulo ombro–quadril–joelho (graus). Referência de extensão do quadril
   * para o módulo de Ponte: próximo de 180° = quadril estendido (topo da ponte);
   * valores menores = quadril flexionado (posição de repouso supina).
   */
  hipExtensionAngleL: number;
  hipExtensionAngleR: number;
}

export function sampleFromLandmarks(lms: Landmark[], t = 0): FrameSample | null {
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

  const keyPoints = [ls, rs, lh, rh, lk, rk, la, ra];
  const vis = keyPoints.reduce((acc, p) => acc + (p.visibility ?? 1), 0) / keyPoints.length;

  return {
    t,
    kneeAngleL: angleDeg(lh, lk, la),
    kneeAngleR: angleDeg(rh, rk, ra),
    kneeValgusL: frontalDeviation(lh, lk, la, hipWidth),
    kneeValgusR: frontalDeviation(rh, rk, ra, hipWidth),
    trunkInclination: trunkInclinationDeg(shouldersMid, hipsMid),
    hipMidY: hipsMid.y,
    meanVisibility: vis,
    valid: vis >= 0.3,
    hipExtensionAngleL: angleDeg(ls, lh, lk),
    hipExtensionAngleR: angleDeg(rs, rh, rk),
  };
}

// ---------------------------------------------------------------------------
// Detecção de repetições (agachamento)
// ---------------------------------------------------------------------------

export interface RepPhase {
  /** Índice em samples[] (após filtragem). */
  start: number;
  bottom: number;
  end: number;
  /** Tempos em segundos. */
  tStart: number;
  tBottom: number;
  tEnd: number;
}

export interface RepMetrics {
  index: number;
  duration_s: number;
  descent_s: number;
  ascent_s: number;
  knee_flexion_range_left_deg: number;
  knee_flexion_range_right_deg: number;
  trunk_inclination_p95_deg: number;
  knee_frontal_deviation_left_p95: number;
  knee_frontal_deviation_right_p95: number;
  bilateral_symmetry: number; // 0..1
  confidence: number; // 0..1 (visibilidade média no intervalo)
  valid: boolean;
}

export interface DetectorParams {
  ema_alpha: number;
  min_range: number;
  peak_ratio: number;
  release_ratio: number;
  min_rep_seconds: number;
  max_rep_seconds: number;
}

export const DEFAULT_DETECTOR: DetectorParams = {
  ema_alpha: 0.3,
  min_range: 0.02,
  peak_ratio: 0.5,
  release_ratio: 0.2,
  min_rep_seconds: 0.4,
  max_rep_seconds: 6,
};

/**
 * Detecção por trajetória vertical do centro dos quadris (y cresce para baixo).
 * Limiar adaptativo: baseline = P10 (topo), alvo = baseline + peak_ratio * (P95-P5).
 * Histerese: precisa recuar até baseline + release_ratio * range para fechar a rep.
 */
export function detectReps(
  hipY: number[],
  times: number[],
  params: DetectorParams = DEFAULT_DETECTOR,
): RepPhase[] {
  if (hipY.length < 6 || hipY.length !== times.length) return [];
  const y = emaSmoothZeroPhase(interpolateInvalid(hipY), params.ema_alpha);
  const p5 = percentile(y, 5);
  const p95 = percentile(y, 95);
  const range = p95 - p5;
  if (!Number.isFinite(range) || range < params.min_range) return [];
  const baseline = percentile(y, 10);
  const peakThresh = baseline + params.peak_ratio * range;
  const releaseThresh = baseline + params.release_ratio * range;

  const reps: RepPhase[] = [];
  let phase: "top" | "descent" | "ascent" = "top";
  let startIdx = 0;
  let bottomIdx = 0;
  let bottomVal = -Infinity;

  for (let i = 0; i < y.length; i++) {
    const v = y[i];
    if (phase === "top") {
      if (v >= peakThresh) {
        phase = "descent";
        // Recuar até último ponto próximo ao topo como início
        let s = i;
        while (s > 0 && y[s - 1] <= releaseThresh + (peakThresh - releaseThresh) * 0.3) s--;
        startIdx = s;
        bottomIdx = i;
        bottomVal = v;
      }
    } else if (phase === "descent" || phase === "ascent") {
      if (v > bottomVal) {
        bottomVal = v;
        bottomIdx = i;
        phase = "descent";
      } else if (v <= releaseThresh) {
        const tStart = times[startIdx];
        const tBottom = times[bottomIdx];
        const tEnd = times[i];
        const dur = tEnd - tStart;
        if (dur >= params.min_rep_seconds && dur <= params.max_rep_seconds) {
          reps.push({
            start: startIdx,
            bottom: bottomIdx,
            end: i,
            tStart,
            tBottom,
            tEnd,
          });
        }
        phase = "top";
        bottomVal = -Infinity;
      } else {
        phase = "ascent";
      }
    }
  }
  return reps;
}

// ---------------------------------------------------------------------------
// Resumo por rep + série
// ---------------------------------------------------------------------------

function repMetricsFor(rep: RepPhase, samples: FrameSample[], index: number): RepMetrics {
  const slice = samples.slice(rep.start, rep.end + 1);
  const kneeL = slice.map((s) => s.kneeAngleL);
  const kneeR = slice.map((s) => s.kneeAngleR);
  const rangeL = safeNum(percentile(kneeL, 95) - percentile(kneeL, 5), 0);
  const rangeR = safeNum(percentile(kneeR, 95) - percentile(kneeR, 5), 0);
  const trunkP95 = safeNum(
    percentile(
      slice.map((s) => s.trunkInclination),
      95,
    ),
    0,
  );
  const devL = safeNum(
    percentile(
      slice.map((s) => Math.abs(s.kneeValgusL)),
      95,
    ),
    0,
  );
  const devR = safeNum(
    percentile(
      slice.map((s) => Math.abs(s.kneeValgusR)),
      95,
    ),
    0,
  );
  const conf = safeNum(mean(slice.map((s) => s.meanVisibility)), 0);
  const denom = Math.max(rangeL, rangeR, 1e-6);
  const symmetry = safeNum(1 - Math.abs(rangeL - rangeR) / denom, 0);
  const duration = safeNum(rep.tEnd - rep.tStart, 0);
  const descent = safeNum(rep.tBottom - rep.tStart, 0);
  const ascent = safeNum(rep.tEnd - rep.tBottom, 0);
  const valid = conf >= 0.4 && rangeL + rangeR > 5 && duration >= 0.4;
  return {
    index,
    duration_s: round(duration, 2),
    descent_s: round(descent, 2),
    ascent_s: round(ascent, 2),
    knee_flexion_range_left_deg: round(rangeL, 1),
    knee_flexion_range_right_deg: round(rangeR, 1),
    trunk_inclination_p95_deg: round(trunkP95, 1),
    knee_frontal_deviation_left_p95: round(devL, 3),
    knee_frontal_deviation_right_p95: round(devR, 3),
    bilateral_symmetry: round(Math.max(0, Math.min(1, symmetry)), 2),
    confidence: round(Math.max(0, Math.min(1, conf)), 2),
    valid,
  };
}

export interface AutoMetricsSummary {
  schema_version: typeof SCHEMA_VERSION;
  engine: typeof ENGINE;
  engine_version: string;
  generated_at: string;
  context: AnalysisContext;
  frames_analyzed: number;
  frames_valid: number;
  valid_frame_ratio: number;
  duration_seconds: number;
  mean_confidence: number;
  detector: DetectorParams;
  filter: { type: "ema-zero-phase"; alpha: number };
  reps_total: number;
  reps_valid: number;
  reps: RepMetrics[];
  summary_stats: {
    knee_flexion_range_left_deg: { median: number; p5: number; p95: number };
    knee_flexion_range_right_deg: { median: number; p5: number; p95: number };
    rep_duration_s: { median: number; p5: number; p95: number };
    trunk_inclination_p95_deg: { median: number };
    knee_frontal_deviation_left_p95: { median: number };
    knee_frontal_deviation_right_p95: { median: number };
    bilateral_symmetry: { median: number };
    confidence: { best: number; worst: number };
    consistency: number; // 0..1
  };
  // Compat com leitura legada (VideoPoseAnalyzer/relatórios anteriores).
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
  symmetry_index: number; // 0..100
  suggestions: string[];
  disclaimer: string;
}

export type AnalysisContext = "squat" | "pilates";

/** Filtra amostras inválidas (baixa visibilidade) e ordena por t. */
function prepareSamples(raw: FrameSample[]): FrameSample[] {
  return raw
    .filter((s) => s && Number.isFinite(s.t))
    .slice()
    .sort((a, b) => a.t - b.t);
}

export function summarizeSamples(
  samplesIn: FrameSample[],
  durationSeconds: number,
  context: AnalysisContext = "squat",
): AutoMetricsSummary {
  const samples = prepareSamples(samplesIn);
  const framesTotal = samples.length;
  const validSamples = samples.filter((s) => s.valid);
  const framesValid = validSamples.length;
  const validRatio = framesTotal > 0 ? framesValid / framesTotal : 0;
  const confMean = safeNum(mean(samples.map((s) => s.meanVisibility)), 0);

  // Séries suavizadas para detecção
  const times = samples.map((s) => s.t);
  const hipY = samples.map((s) => (s.valid ? s.hipMidY : NaN));
  const reps = detectReps(hipY, times);

  // Métricas por rep
  const repMetrics = reps.map((r, i) => repMetricsFor(r, samples, i + 1));
  const validReps = repMetrics.filter((r) => r.valid);

  const rangeLs = validReps.map((r) => r.knee_flexion_range_left_deg);
  const rangeRs = validReps.map((r) => r.knee_flexion_range_right_deg);
  const durs = validReps.map((r) => r.duration_s);
  const trunks = validReps.map((r) => r.trunk_inclination_p95_deg);
  const devLs = validReps.map((r) => r.knee_frontal_deviation_left_p95);
  const devRs = validReps.map((r) => r.knee_frontal_deviation_right_p95);
  const syms = validReps.map((r) => r.bilateral_symmetry);
  const confs = validReps.map((r) => r.confidence);

  const consistencyBase = rangeRs.length >= 2 ? rangeRs : rangeLs;
  const cv =
    consistencyBase.length >= 2
      ? stdev(consistencyBase) / Math.max(1e-6, mean(consistencyBase))
      : 0;
  const consistency = round(Math.max(0, Math.min(1, 1 - cv)), 2);

  // Compat legado
  const legacyKneeL = validSamples.map((s) => s.kneeAngleL);
  const legacyKneeR = validSamples.map((s) => s.kneeAngleR);
  const legacyTrunk = validSamples.map((s) => s.trunkInclination);
  const legacyHipY = validSamples.map((s) => s.hipMidY);
  const legacyDevL = Math.max(
    0,
    ...validSamples.map((s) => Math.abs(s.kneeValgusL)).filter(Number.isFinite),
  );
  const legacyDevR = Math.max(
    0,
    ...validSamples.map((s) => Math.abs(s.kneeValgusR)).filter(Number.isFinite),
  );

  const kneeLmin = safeNum(percentile(legacyKneeL, 5), 0);
  const kneeLmax = safeNum(percentile(legacyKneeL, 95), 0);
  const kneeRmin = safeNum(percentile(legacyKneeR, 5), 0);
  const kneeRmax = safeNum(percentile(legacyKneeR, 95), 0);
  const trunkMax = safeNum(percentile(legacyTrunk, 95), 0);
  const trunkMean = safeNum(mean(legacyTrunk), 0);
  const hipAmp = safeNum((percentile(legacyHipY, 95) || 0) - (percentile(legacyHipY, 5) || 0), 0);
  const legacySymmetry = Math.round(100 * Math.max(0, Math.min(1, safeNum(mean(syms), 0))));

  const suggestions: string[] = [];
  const canSuggest = framesValid >= 6 && confMean >= 0.4 && validReps.length >= 1;
  if (canSuggest) {
    const medRangeL = median(rangeLs);
    const medRangeR = median(rangeRs);
    const medTrunk = median(trunks);
    const medDevL = median(devLs);
    const medDevR = median(devRs);
    const medSym = median(syms);
    if (Number.isFinite(medDevR) && medDevR > 0.15)
      suggestions.push(
        "Deslocamento frontal aparente do joelho direito acima do esperado — sugere-se confirmação clínica presencial.",
      );
    if (Number.isFinite(medDevL) && medDevL > 0.15)
      suggestions.push(
        "Deslocamento frontal aparente do joelho esquerdo acima do esperado — sugere-se confirmação clínica presencial.",
      );
    if (
      Number.isFinite(medRangeL) &&
      Number.isFinite(medRangeR) &&
      Math.abs(medRangeL - medRangeR) > 12
    )
      suggestions.push(
        "Possível diferença bilateral na amplitude do joelho — sugere-se avaliação segmentar.",
      );
    if (Number.isFinite(medTrunk) && medTrunk > 45)
      suggestions.push(
        "Inclinação de tronco elevada durante o agachamento — sugere-se observar controle de tronco/quadril.",
      );
    if (Number.isFinite(medSym) && medSym < 0.7)
      suggestions.push(
        "Baixa simetria bilateral média entre repetições — sugere-se observação clínica adicional.",
      );
  } else {
    suggestions.push(
      "Qualidade insuficiente para gerar sugestões — recomenda-se nova captura com melhor enquadramento e iluminação.",
    );
  }

  return {
    schema_version: SCHEMA_VERSION,
    engine: ENGINE,
    engine_version: ENGINE_VERSION,
    generated_at: new Date().toISOString(),
    context,
    frames_analyzed: framesTotal,
    frames_valid: framesValid,
    valid_frame_ratio: round(validRatio, 2),
    duration_seconds: round(durationSeconds, 2),
    mean_confidence: round(confMean, 2),
    detector: DEFAULT_DETECTOR,
    filter: { type: "ema-zero-phase", alpha: DEFAULT_DETECTOR.ema_alpha },
    reps_total: repMetrics.length,
    reps_valid: validReps.length,
    reps: repMetrics,
    summary_stats: {
      knee_flexion_range_left_deg: {
        median: round(safeNum(median(rangeLs)), 1),
        p5: round(safeNum(percentile(rangeLs, 5)), 1),
        p95: round(safeNum(percentile(rangeLs, 95)), 1),
      },
      knee_flexion_range_right_deg: {
        median: round(safeNum(median(rangeRs)), 1),
        p5: round(safeNum(percentile(rangeRs, 5)), 1),
        p95: round(safeNum(percentile(rangeRs, 95)), 1),
      },
      rep_duration_s: {
        median: round(safeNum(median(durs)), 2),
        p5: round(safeNum(percentile(durs, 5)), 2),
        p95: round(safeNum(percentile(durs, 95)), 2),
      },
      trunk_inclination_p95_deg: { median: round(safeNum(median(trunks)), 1) },
      knee_frontal_deviation_left_p95: { median: round(safeNum(median(devLs)), 3) },
      knee_frontal_deviation_right_p95: { median: round(safeNum(median(devRs)), 3) },
      bilateral_symmetry: { median: round(safeNum(median(syms)), 2) },
      confidence: {
        best: round(confs.length ? Math.max(...confs) : 0, 2),
        worst: round(confs.length ? Math.min(...confs) : 0, 2),
      },
      consistency,
    },
    knee_flexion: {
      left: {
        min_deg: Math.round(kneeLmin),
        max_deg: Math.round(kneeLmax),
        range_deg: Math.round(Math.max(0, kneeLmax - kneeLmin)),
      },
      right: {
        min_deg: Math.round(kneeRmin),
        max_deg: Math.round(kneeRmax),
        range_deg: Math.round(Math.max(0, kneeRmax - kneeRmin)),
      },
    },
    knee_frontal_deviation: {
      left_max_abs: round(legacyDevL, 2),
      right_max_abs: round(legacyDevR, 2),
      note: "Deslocamento frontal aparente do joelho em relação à linha quadril-tornozelo, normalizado pela largura pélvica. Estimativa 2D — não é diagnóstico de valgo dinâmico.",
    },
    trunk_inclination: {
      max_deg: Math.round(trunkMax),
      mean_deg: Math.round(trunkMean),
    },
    hip_vertical_amplitude: {
      normalized: round(hipAmp, 3),
      note: "Deslocamento vertical do quadril em coordenadas normalizadas do frame.",
    },
    symmetry_index: legacySymmetry,
    suggestions,
    disclaimer:
      "Estimativa automática 2D — apoio à decisão. Requer confirmação profissional. Não é diagnóstico.",
  };
}

export function isAutoMetricsSummary(value: unknown): value is AutoMetricsSummary {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.engine === ENGINE && typeof v.frames_analyzed === "number";
}

export function toJson(summary: AutoMetricsSummary): Json {
  return summary as unknown as Json;
}

// ---------------------------------------------------------------------------
// Módulo Ponte (Pelvic Curl)
// ---------------------------------------------------------------------------
// Convenção: em vista lateral supina, o quadril SOBE quando hipMidY diminui
// (y cresce para baixo no espaço de imagem). A "repetição" da ponte é o ciclo
// repouso → topo (quadril elevado) → repouso. Para reaproveitar o detector
// determinístico já validado, invertemos a série de hipMidY: assim o "pico"
// vira o momento de máxima elevação.

/** Detecta repetições de ponte reutilizando o detector do agachamento sobre -hipMidY. */
export function detectBridgeReps(
  hipY: number[],
  times: number[],
  params: DetectorParams = DEFAULT_DETECTOR,
): RepPhase[] {
  const inverted = hipY.map((v) => (Number.isFinite(v) ? -v : NaN));
  return detectReps(inverted, times, params);
}

export interface BridgeRepMetrics {
  index: number;
  duration_s: number;
  ascent_s: number; // repouso → topo (quadril sobe)
  descent_s: number; // topo → repouso (quadril desce)
  hip_extension_range_left_deg: number;
  hip_extension_range_right_deg: number;
  hip_extension_peak_left_deg: number;
  hip_extension_peak_right_deg: number;
  hip_vertical_amplitude: number; // normalizado (coordenada de frame)
  bilateral_symmetry: number; // 0..1
  confidence: number; // 0..1
  valid: boolean;
}

export interface BridgeMetricsSummary {
  schema_version: typeof SCHEMA_VERSION;
  engine: typeof ENGINE;
  engine_version: string;
  generated_at: string;
  context: "bridge";
  frames_analyzed: number;
  frames_valid: number;
  valid_frame_ratio: number;
  duration_seconds: number;
  mean_confidence: number;
  detector: DetectorParams;
  filter: { type: "ema-zero-phase"; alpha: number };
  reps_total: number;
  reps_valid: number;
  reps: BridgeRepMetrics[];
  summary_stats: {
    hip_extension_range_left_deg: { median: number; p5: number; p95: number };
    hip_extension_range_right_deg: { median: number; p5: number; p95: number };
    hip_extension_peak_left_deg: { median: number };
    hip_extension_peak_right_deg: { median: number };
    hip_vertical_amplitude: { median: number };
    rep_duration_s: { median: number; p5: number; p95: number };
    bilateral_symmetry: { median: number };
    confidence: { best: number; worst: number };
    consistency: number;
  };
  suggestions: string[];
  disclaimer: string;
}

function bridgeRepMetricsFor(
  rep: RepPhase,
  samples: FrameSample[],
  index: number,
): BridgeRepMetrics {
  const slice = samples.slice(rep.start, rep.end + 1);
  const extL = slice.map((s) => s.hipExtensionAngleL);
  const extR = slice.map((s) => s.hipExtensionAngleR);
  const hipYs = slice.map((s) => s.hipMidY);
  // Amplitude = pico (topo) − vale (repouso). No topo o ângulo é MAIOR (mais estendido).
  const rangeL = safeNum(percentile(extL, 95) - percentile(extL, 5), 0);
  const rangeR = safeNum(percentile(extR, 95) - percentile(extR, 5), 0);
  const peakL = safeNum(percentile(extL, 95), 0);
  const peakR = safeNum(percentile(extR, 95), 0);
  const hipAmp = safeNum(percentile(hipYs, 95) - percentile(hipYs, 5), 0);
  const conf = safeNum(mean(slice.map((s) => s.meanVisibility)), 0);
  const denom = Math.max(rangeL, rangeR, 1e-6);
  const symmetry = safeNum(1 - Math.abs(rangeL - rangeR) / denom, 0);
  const duration = safeNum(rep.tEnd - rep.tStart, 0);
  const ascent = safeNum(rep.tBottom - rep.tStart, 0);
  const descent = safeNum(rep.tEnd - rep.tBottom, 0);
  const valid = conf >= 0.4 && rangeL + rangeR > 10 && duration >= 0.4;
  return {
    index,
    duration_s: round(duration, 2),
    ascent_s: round(ascent, 2),
    descent_s: round(descent, 2),
    hip_extension_range_left_deg: round(rangeL, 1),
    hip_extension_range_right_deg: round(rangeR, 1),
    hip_extension_peak_left_deg: round(peakL, 1),
    hip_extension_peak_right_deg: round(peakR, 1),
    hip_vertical_amplitude: round(hipAmp, 3),
    bilateral_symmetry: round(Math.max(0, Math.min(1, symmetry)), 2),
    confidence: round(Math.max(0, Math.min(1, conf)), 2),
    valid,
  };
}

/**
 * Resumo do módulo Ponte: detecção de repetições e amplitude de extensão
 * de quadril (ângulo ombro–quadril–joelho) por lado, com estatísticas por rep
 * e agregadas. Determinístico; nenhuma inferência clínica é emitida — todos
 * os valores são indicadores de APOIO sujeitos a confirmação profissional.
 */
export function summarizeBridgeSamples(
  samplesIn: FrameSample[],
  durationSeconds: number,
): BridgeMetricsSummary {
  const samples = prepareSamples(samplesIn);
  const framesTotal = samples.length;
  const validSamples = samples.filter((s) => s.valid);
  const framesValid = validSamples.length;
  const validRatio = framesTotal > 0 ? framesValid / framesTotal : 0;
  const confMean = safeNum(mean(samples.map((s) => s.meanVisibility)), 0);

  const times = samples.map((s) => s.t);
  const hipY = samples.map((s) => (s.valid ? s.hipMidY : NaN));
  const reps = detectBridgeReps(hipY, times);
  const repMetrics = reps.map((r, i) => bridgeRepMetricsFor(r, samples, i + 1));
  const validReps = repMetrics.filter((r) => r.valid);

  const rangeLs = validReps.map((r) => r.hip_extension_range_left_deg);
  const rangeRs = validReps.map((r) => r.hip_extension_range_right_deg);
  const peakLs = validReps.map((r) => r.hip_extension_peak_left_deg);
  const peakRs = validReps.map((r) => r.hip_extension_peak_right_deg);
  const hipAmps = validReps.map((r) => r.hip_vertical_amplitude);
  const durs = validReps.map((r) => r.duration_s);
  const syms = validReps.map((r) => r.bilateral_symmetry);
  const confs = validReps.map((r) => r.confidence);

  const consistencyBase = rangeRs.length >= 2 ? rangeRs : rangeLs;
  const cv =
    consistencyBase.length >= 2
      ? stdev(consistencyBase) / Math.max(1e-6, mean(consistencyBase))
      : 0;
  const consistency = round(Math.max(0, Math.min(1, 1 - cv)), 2);

  const suggestions: string[] = [];
  const canSuggest = framesValid >= 6 && confMean >= 0.4 && validReps.length >= 1;
  if (canSuggest) {
    const medRangeL = median(rangeLs);
    const medRangeR = median(rangeRs);
    const medSym = median(syms);
    if (
      Number.isFinite(medRangeL) &&
      Number.isFinite(medRangeR) &&
      Math.abs(medRangeL - medRangeR) > 10
    )
      suggestions.push(
        "Possível diferença bilateral na amplitude de extensão do quadril durante a ponte — sugere-se avaliação segmentar.",
      );
    if (Number.isFinite(medSym) && medSym < 0.7)
      suggestions.push(
        "Baixa simetria bilateral média entre repetições da ponte — sugere-se observação clínica adicional.",
      );
  } else {
    suggestions.push(
      "Qualidade insuficiente para gerar sugestões — recomenda-se nova captura com melhor enquadramento e iluminação.",
    );
  }

  return {
    schema_version: SCHEMA_VERSION,
    engine: ENGINE,
    engine_version: ENGINE_VERSION,
    generated_at: new Date().toISOString(),
    context: "bridge",
    frames_analyzed: framesTotal,
    frames_valid: framesValid,
    valid_frame_ratio: round(validRatio, 2),
    duration_seconds: round(durationSeconds, 2),
    mean_confidence: round(confMean, 2),
    detector: DEFAULT_DETECTOR,
    filter: { type: "ema-zero-phase", alpha: DEFAULT_DETECTOR.ema_alpha },
    reps_total: repMetrics.length,
    reps_valid: validReps.length,
    reps: repMetrics,
    summary_stats: {
      hip_extension_range_left_deg: {
        median: round(safeNum(median(rangeLs)), 1),
        p5: round(safeNum(percentile(rangeLs, 5)), 1),
        p95: round(safeNum(percentile(rangeLs, 95)), 1),
      },
      hip_extension_range_right_deg: {
        median: round(safeNum(median(rangeRs)), 1),
        p5: round(safeNum(percentile(rangeRs, 5)), 1),
        p95: round(safeNum(percentile(rangeRs, 95)), 1),
      },
      hip_extension_peak_left_deg: { median: round(safeNum(median(peakLs)), 1) },
      hip_extension_peak_right_deg: { median: round(safeNum(median(peakRs)), 1) },
      hip_vertical_amplitude: { median: round(safeNum(median(hipAmps)), 3) },
      rep_duration_s: {
        median: round(safeNum(median(durs)), 2),
        p5: round(safeNum(percentile(durs, 5)), 2),
        p95: round(safeNum(percentile(durs, 95)), 2),
      },
      bilateral_symmetry: { median: round(safeNum(median(syms)), 2) },
      confidence: {
        best: round(confs.length ? Math.max(...confs) : 0, 2),
        worst: round(confs.length ? Math.min(...confs) : 0, 2),
      },
      consistency,
    },
    suggestions,
    disclaimer:
      "Estimativa automática 2D — apoio à decisão. Requer confirmação profissional. Não é diagnóstico.",
  };
}

export function isBridgeMetricsSummary(value: unknown): value is BridgeMetricsSummary {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.engine === ENGINE && v.context === "bridge" && typeof v.frames_analyzed === "number";
}
