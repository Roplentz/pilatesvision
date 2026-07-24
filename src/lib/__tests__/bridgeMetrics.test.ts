import { describe, it, expect } from "vitest";
import {
  detectBridgeReps,
  sampleFromLandmarks,
  summarizeBridgeSamples,
  isBridgeMetricsSummary,
  type FrameSample,
  type Landmark,
} from "@/lib/poseMetrics";

// Sintetiza landmarks laterais em decúbito dorsal:
// - Ombro fixo (referência de apoio).
// - Joelho fixo (pés apoiados no chão).
// - Quadril sobe (y diminui) e o ângulo ombro–quadril–joelho aumenta em direção a 180°.
function synthBridgeLandmarks(hipY: number): Landmark[] {
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));
  const shoulderX = 0.2;
  const shoulderY = 0.6;
  const kneeX = 0.7;
  const kneeY = 0.6;
  lms[11] = { x: shoulderX, y: shoulderY, visibility: 0.95 };
  lms[12] = { x: shoulderX, y: shoulderY, visibility: 0.95 };
  const hipX = 0.45;
  lms[23] = { x: hipX, y: hipY, visibility: 0.95 };
  lms[24] = { x: hipX, y: hipY, visibility: 0.95 };
  lms[25] = { x: kneeX, y: kneeY, visibility: 0.95 };
  lms[26] = { x: kneeX, y: kneeY, visibility: 0.95 };
  lms[27] = { x: kneeX + 0.05, y: 0.8, visibility: 0.9 };
  lms[28] = { x: kneeX + 0.05, y: 0.8, visibility: 0.9 };
  return lms;
}

function bridgeSeries(reps: number, framesPerRep = 24): FrameSample[] {
  const out: FrameSample[] = [];
  const total = reps > 0 ? reps * framesPerRep : framesPerRep;
  const restY = 0.65; // quadril baixo (repouso supino)
  const lift = 0.15; // sobe até 0.50
  for (let i = 0; i < total; i++) {
    const phase = reps > 0 ? (i % framesPerRep) / framesPerRep : 0;
    // seno positivo → hipY DESCE (sobe fisicamente)
    const y = reps > 0 ? restY - lift * Math.sin(phase * Math.PI) : restY;
    const s = sampleFromLandmarks(synthBridgeLandmarks(y), i / 10);
    if (s) out.push(s);
  }
  return out;
}

describe("detectBridgeReps", () => {
  it("retorna 0 repetições para série constante", () => {
    const samples = bridgeSeries(0, 30);
    const hipY = samples.map((s) => s.hipMidY);
    const t = samples.map((s) => s.t);
    expect(detectBridgeReps(hipY, t)).toEqual([]);
  });

  it("detecta 3 repetições em série de 3 ciclos de ponte", () => {
    const samples = bridgeSeries(3, 24);
    const hipY = samples.map((s) => s.hipMidY);
    const t = samples.map((s) => s.t);
    const reps = detectBridgeReps(hipY, t);
    expect(reps.length).toBeGreaterThanOrEqual(2);
    expect(reps.length).toBeLessThanOrEqual(4);
  });
});

describe("summarizeBridgeSamples", () => {
  it("nunca retorna NaN/Infinity no JSON e marca reps_valid=0 sem série", () => {
    const summary = summarizeBridgeSamples([], 0);
    const json = JSON.stringify(summary);
    expect(json.includes("NaN")).toBe(false);
    expect(json.includes("Infinity")).toBe(false);
    expect(summary.reps_total).toBe(0);
    expect(summary.reps_valid).toBe(0);
    expect(isBridgeMetricsSummary(summary)).toBe(true);
  });

  it("resume repetições sintéticas com amplitude de extensão finita e > 0", () => {
    const samples = bridgeSeries(3, 24);
    const dur = samples[samples.length - 1].t;
    const summary = summarizeBridgeSamples(samples, dur);
    expect(summary.reps_total).toBeGreaterThanOrEqual(2);
    expect(summary.reps_valid).toBeGreaterThanOrEqual(1);
    const medL = summary.summary_stats.hip_extension_range_left_deg.median;
    const medR = summary.summary_stats.hip_extension_range_right_deg.median;
    expect(Number.isFinite(medL)).toBe(true);
    expect(Number.isFinite(medR)).toBe(true);
    expect(medL).toBeGreaterThan(5);
    expect(medR).toBeGreaterThan(5);
    // Pico de extensão no topo deve ser maior que a amplitude (ângulo absoluto).
    expect(summary.summary_stats.hip_extension_peak_left_deg.median).toBeGreaterThan(medL);
  });
});