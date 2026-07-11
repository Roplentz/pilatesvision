import { describe, it, expect } from "vitest";
import {
  detectReps,
  emaSmoothZeroPhase,
  interpolateInvalid,
  median,
  percentile,
  sampleFromLandmarks,
  summarizeSamples,
  isAutoMetricsSummary,
  type FrameSample,
  type Landmark,
} from "@/lib/poseMetrics";

// -----------------------------
// Helpers para gerar dados sintéticos
// -----------------------------

function synthLandmarks(hipY: number, kneeAngle: number): Landmark[] {
  // 33 pontos, mas apenas os que importam recebem coordenadas coerentes.
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));
  lms[0] = { x: 0.5, y: 0.15, visibility: 0.95 }; // nariz
  lms[11] = { x: 0.42, y: 0.30, visibility: 0.9 };
  lms[12] = { x: 0.58, y: 0.30, visibility: 0.9 };
  lms[23] = { x: 0.44, y: hipY, visibility: 0.9 };
  lms[24] = { x: 0.56, y: hipY, visibility: 0.9 };
  // Modela perna como dois segmentos coxa (hip→knee) e canela (knee→ankle),
  // com o joelho deslocado horizontalmente conforme o ângulo (menor ângulo => mais flexão).
  // Ângulo em graus entre coxa e canela.
  const seg = 0.18;
  const half = ((180 - kneeAngle) / 2) * (Math.PI / 180);
  const kneeDx = seg * Math.sin(half);
  const kneeDy = seg * Math.cos(half);
  lms[25] = { x: 0.44 - kneeDx, y: hipY + kneeDy, visibility: 0.9 };
  lms[26] = { x: 0.56 + kneeDx, y: hipY + kneeDy, visibility: 0.9 };
  lms[27] = { x: 0.44, y: hipY + 2 * kneeDy, visibility: 0.9 };
  lms[28] = { x: 0.56, y: hipY + 2 * kneeDy, visibility: 0.9 };
  return lms;
}

function seriesForReps(reps: number, framesPerRep = 20, baseY = 0.42, depth = 0.10): FrameSample[] {
  const out: FrameSample[] = [];
  const total = reps > 0 ? reps * framesPerRep : framesPerRep;
  for (let i = 0; i < total; i++) {
    const phase = reps > 0 ? (i % framesPerRep) / framesPerRep : 0;
    // seno positivo (y desce = agachou)
    const y = reps > 0 ? baseY + depth * Math.sin(phase * Math.PI) : baseY;
    // Ângulo de joelho de 170° (em pé) até ~90° no fundo do agachamento.
    const kneeAngle = 170 - ((y - baseY) / depth) * 80;
    const s = sampleFromLandmarks(synthLandmarks(y, kneeAngle), i / 10);
    if (s) out.push(s);
  }
  return out;
}

// -----------------------------
// Testes
// -----------------------------

describe("núcleo matemático", () => {
  it("median/percentile lidam com listas pequenas e vazias sem NaN não intencional", () => {
    expect(median([])).toBeNaN();
    expect(median([1, 2, 3])).toBe(2);
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5);
    expect(percentile([10], 95)).toBe(10);
  });

  it("emaSmoothZeroPhase preserva número de amostras", () => {
    const out = emaSmoothZeroPhase([1, 2, 3, 4, 5], 0.3);
    expect(out.length).toBe(5);
    expect(out.every((v) => Number.isFinite(v))).toBe(true);
  });

  it("interpolateInvalid preenche NaNs internos linearmente", () => {
    const out = interpolateInvalid([1, NaN, NaN, 4]);
    expect(out[0]).toBe(1);
    expect(out[3]).toBe(4);
    expect(out[1]).toBeCloseTo(2, 5);
    expect(out[2]).toBeCloseTo(3, 5);
  });
});

describe("detectReps", () => {
  it("retorna 0 repetições para série constante", () => {
    const y = Array.from({ length: 30 }, () => 0.5);
    const t = y.map((_, i) => i / 10);
    expect(detectReps(y, t)).toEqual([]);
  });

  it("detecta ~1 repetição em série senoidal única", () => {
    const samples = seriesForReps(1, 24);
    const y = samples.map((s) => s.hipMidY);
    const t = samples.map((s) => s.t);
    const reps = detectReps(y, t);
    expect(reps.length).toBeGreaterThanOrEqual(1);
  });

  it("detecta 3 repetições em série de 3 ciclos", () => {
    const samples = seriesForReps(3, 24);
    const y = samples.map((s) => s.hipMidY);
    const t = samples.map((s) => s.t);
    const reps = detectReps(y, t);
    expect(reps.length).toBeGreaterThanOrEqual(2);
    expect(reps.length).toBeLessThanOrEqual(4);
  });
});

describe("summarizeSamples", () => {
  it("nunca retorna NaN ou Infinity no JSON serializado", () => {
    const summary = summarizeSamples([], 0, "squat");
    const json = JSON.stringify(summary);
    expect(json.includes("NaN")).toBe(false);
    expect(json.includes("Infinity")).toBe(false);
    expect(isAutoMetricsSummary(summary)).toBe(true);
  });

  it("marca reps_valid=0 quando não há série", () => {
    const summary = summarizeSamples([], 0, "squat");
    expect(summary.reps_total).toBe(0);
    expect(summary.reps_valid).toBe(0);
    expect(summary.frames_analyzed).toBe(0);
  });

  it("resume 3 repetições sintéticas com métricas finitas e reps_valid >= 1", () => {
    const samples = seriesForReps(3, 24);
    const duration = samples[samples.length - 1].t;
    const summary = summarizeSamples(samples, duration, "squat");
    expect(summary.reps_total).toBeGreaterThanOrEqual(2);
    expect(summary.reps_valid).toBeGreaterThanOrEqual(1);
    expect(Number.isFinite(summary.summary_stats.knee_flexion_range_right_deg.median)).toBe(true);
    expect(Number.isFinite(summary.summary_stats.rep_duration_s.median)).toBe(true);
    // JSON limpo
    const json = JSON.stringify(summary);
    expect(json.includes("NaN")).toBe(false);
    expect(json.includes("Infinity")).toBe(false);
  });

  it("é robusto a outliers isolados e amostras com baixa visibilidade", () => {
    const samples = seriesForReps(2, 24);
    // Injeta outlier grosseiro
    samples[10] = { ...samples[10], hipMidY: 5, kneeAngleL: 999, kneeAngleR: 999 };
    // Injeta amostras inválidas
    samples[15] = { ...samples[15], meanVisibility: 0.1, valid: false };
    const summary = summarizeSamples(samples, samples[samples.length - 1].t, "squat");
    const json = JSON.stringify(summary);
    expect(json.includes("NaN")).toBe(false);
    expect(json.includes("Infinity")).toBe(false);
    expect(summary.reps_total).toBeGreaterThanOrEqual(1);
  });

  it("com baixa visibilidade global, gera sugestão de recaptura ao invés de sugestões clínicas", () => {
    const samples = seriesForReps(2, 24).map((s) => ({ ...s, meanVisibility: 0.1, valid: false }));
    const summary = summarizeSamples(samples, samples[samples.length - 1].t, "squat");
    expect(summary.suggestions.some((s) => s.toLowerCase().includes("recaptura") || s.toLowerCase().includes("qualidade"))).toBe(true);
  });
});
