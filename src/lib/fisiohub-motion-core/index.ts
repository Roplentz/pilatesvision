// ---------------------------------------------------------------------------
// FisioHub Motion Core — biblioteca interna mínima (sombra).
//
// Implementação estritamente para permitir execução em MODO SOMBRA a partir
// do fluxo real do VideoPoseAnalyzer. Não altera o motor legado
// (poseMetrics) nem os resultados oficiais persistidos.
//
// Contratos expostos:
//   - RawFrame               → frame bruto do MediaPipe entregue pelo caller
//   - MotionSeries           → série normalizada (input canônico do core)
//   - mediapipeAdapter()     → converte RawFrame[] em MotionSeries
//   - analyzeSquatSeries()   → análise agachamento (reps, eventos, métricas)
//
// Observação de design: para não duplicar a heurística já validada, esta
// implementação reutiliza o núcleo determinístico do motor legado
// (`sampleFromLandmarks` + `detectReps` + agregações) mas expõe um contrato
// separado, versionado e serializável — que é o que a camada shadow precisa
// para comparar/observar sem interferir.
// ---------------------------------------------------------------------------

import {
  DEFAULT_DETECTOR,
  detectReps,
  emaSmoothZeroPhase,
  interpolateInvalid,
  median,
  percentile,
  round,
  sampleFromLandmarks,
  type FrameSample,
  type Landmark,
  type RepPhase,
} from "@/lib/poseMetrics";

export const MOTION_CORE_ENGINE = "fisiohub-motion-core";
export const MOTION_CORE_VERSION = "0.1.0-internal";

/** Frame bruto emitido pelo caller (MediaPipe Pose). */
export interface RawFrame {
  frameNumber: number;
  timestampSeconds: number;
  landmarks: Landmark[];
}

/** Série normalizada — entrada canônica do motion core. */
export interface MotionSeries {
  samples: FrameSample[];
  durationSeconds: number;
  framesReceived: number;
}

export interface SquatEvent {
  index: number;
  type: "descent_start" | "bottom" | "ascent_end";
  tSeconds: number;
  hipMidY: number;
}

export interface SquatRepetition {
  index: number;
  tStart: number;
  tBottom: number;
  tEnd: number;
  durationSeconds: number;
  descentSeconds: number;
  ascentSeconds: number;
  kneeFlexionRangeLeftDeg: number;
  kneeFlexionRangeRightDeg: number;
  bilateralSymmetry: number;
  confidence: number;
  valid: boolean;
}

export interface SquatMetrics {
  kneeFlexionRangeLeftMedianDeg: number;
  kneeFlexionRangeRightMedianDeg: number;
  repDurationMedianSeconds: number;
  bilateralSymmetryMedian: number;
  confidenceMean: number;
}

export interface SquatAnalysis {
  framesAnalyzed: number;
  framesValid: number;
  validFrameRatio: number;
  repetitionsDetected: number;
  repetitionsValid: number;
  repetitions: SquatRepetition[];
  events: SquatEvent[];
  metrics: SquatMetrics;
}

/** Adaptador MediaPipe → MotionSeries. */
export function mediapipeAdapter(frames: RawFrame[]): MotionSeries {
  const samples: FrameSample[] = [];
  let lastT = 0;
  for (const f of frames) {
    if (!f || !Array.isArray(f.landmarks)) continue;
    const s = sampleFromLandmarks(f.landmarks, f.timestampSeconds);
    if (s) {
      samples.push(s);
      if (f.timestampSeconds > lastT) lastT = f.timestampSeconds;
    }
  }
  return {
    samples,
    durationSeconds: round(lastT, 3),
    framesReceived: frames.length,
  };
}

function safeMedian(values: number[]): number {
  const m = median(values);
  return Number.isFinite(m) ? round(m, 2) : 0;
}

function repFromPhase(
  phase: RepPhase,
  samples: FrameSample[],
): SquatRepetition {
  const slice = samples.slice(phase.start, phase.end + 1);
  const kneesL = slice.map((s) => s.kneeAngleL).filter(Number.isFinite);
  const kneesR = slice.map((s) => s.kneeAngleR).filter(Number.isFinite);
  const vis = slice.map((s) => s.meanVisibility).filter(Number.isFinite);
  const rangeL = kneesL.length ? Math.max(...kneesL) - Math.min(...kneesL) : 0;
  const rangeR = kneesR.length ? Math.max(...kneesR) - Math.min(...kneesR) : 0;
  const confidence = vis.length
    ? vis.reduce((a, b) => a + b, 0) / vis.length
    : 0;
  const symmetry =
    rangeL > 0 && rangeR > 0
      ? Math.min(rangeL, rangeR) / Math.max(rangeL, rangeR)
      : 0;
  const duration = Math.max(0, phase.tEnd - phase.tStart);
  const valid =
    duration >= 0.4 && Math.min(rangeL, rangeR) >= 20 && confidence >= 0.4;
  return {
    index: 0,
    tStart: round(phase.tStart, 3),
    tBottom: round(phase.tBottom, 3),
    tEnd: round(phase.tEnd, 3),
    durationSeconds: round(duration, 3),
    descentSeconds: round(Math.max(0, phase.tBottom - phase.tStart), 3),
    ascentSeconds: round(Math.max(0, phase.tEnd - phase.tBottom), 3),
    kneeFlexionRangeLeftDeg: round(rangeL, 2),
    kneeFlexionRangeRightDeg: round(rangeR, 2),
    bilateralSymmetry: round(symmetry, 3),
    confidence: round(confidence, 3),
    valid,
  };
}

export function analyzeSquatSeries(series: MotionSeries): SquatAnalysis {
  const samples = series.samples;
  const framesAnalyzed = samples.length;
  const framesValid = samples.filter((s) => s.valid).length;
  const validFrameRatio = framesAnalyzed > 0 ? framesValid / framesAnalyzed : 0;

  if (framesAnalyzed < 6) {
    return {
      framesAnalyzed,
      framesValid,
      validFrameRatio: round(validFrameRatio, 3),
      repetitionsDetected: 0,
      repetitionsValid: 0,
      repetitions: [],
      events: [],
      metrics: {
        kneeFlexionRangeLeftMedianDeg: 0,
        kneeFlexionRangeRightMedianDeg: 0,
        repDurationMedianSeconds: 0,
        bilateralSymmetryMedian: 0,
        confidenceMean: 0,
      },
    };
  }

  const hipY = samples.map((s) => s.hipMidY);
  const times = samples.map((s) => s.t);
  // pré-suavização apenas para expor o padrão determinístico do core
  const _smoothed = emaSmoothZeroPhase(
    interpolateInvalid(hipY),
    DEFAULT_DETECTOR.ema_alpha,
  );
  const _p95 = percentile(_smoothed, 95); // guardrail; não usado externamente
  void _p95;

  const phases = detectReps(hipY, times);
  const reps = phases.map((p, i) => ({
    ...repFromPhase(p, samples),
    index: i + 1,
  }));
  const validReps = reps.filter((r) => r.valid);

  const events: SquatEvent[] = [];
  for (const p of phases) {
    const start = samples[p.start];
    const bottom = samples[p.bottom];
    const end = samples[p.end];
    if (start)
      events.push({
        index: events.length,
        type: "descent_start",
        tSeconds: round(start.t, 3),
        hipMidY: round(start.hipMidY, 4),
      });
    if (bottom)
      events.push({
        index: events.length,
        type: "bottom",
        tSeconds: round(bottom.t, 3),
        hipMidY: round(bottom.hipMidY, 4),
      });
    if (end)
      events.push({
        index: events.length,
        type: "ascent_end",
        tSeconds: round(end.t, 3),
        hipMidY: round(end.hipMidY, 4),
      });
  }

  const metrics: SquatMetrics = {
    kneeFlexionRangeLeftMedianDeg: safeMedian(
      reps.map((r) => r.kneeFlexionRangeLeftDeg),
    ),
    kneeFlexionRangeRightMedianDeg: safeMedian(
      reps.map((r) => r.kneeFlexionRangeRightDeg),
    ),
    repDurationMedianSeconds: safeMedian(reps.map((r) => r.durationSeconds)),
    bilateralSymmetryMedian: safeMedian(reps.map((r) => r.bilateralSymmetry)),
    confidenceMean: round(
      reps.length
        ? reps.reduce((a, r) => a + r.confidence, 0) / reps.length
        : 0,
      3,
    ),
  };

  return {
    framesAnalyzed,
    framesValid,
    validFrameRatio: round(validFrameRatio, 3),
    repetitionsDetected: reps.length,
    repetitionsValid: validReps.length,
    repetitions: reps,
    events,
    metrics,
  };
}
