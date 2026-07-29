import type { MotionEvent, MotionMetric, MotionSeries } from "../schema";
import { mean } from "../temporal";
import {
  DEFAULT_SQUAT_DETECTOR,
  detectSquatRepetitions,
  sampleSquatFrame,
  type SquatDetectorOptions,
  type SquatFrameSample,
  type SquatRepPhase,
} from "../biomechanics/squat";

export const SQUAT_ANALYSIS_ENGINE_VERSION = "squat-analysis-v1" as const;

export interface SquatRepetitionSummary {
  repetition: number;
  startFrame: number;
  bottomFrame: number;
  endFrame: number;
  durationSeconds: number;
  descentSeconds: number;
  ascentSeconds: number;
  leftKneeFlexionRangeDeg: number;
  rightKneeFlexionRangeDeg: number;
  trunkInclinationP95Deg: number;
  leftKneeFrontalDeviationP95: number;
  rightKneeFrontalDeviationP95: number;
  bilateralSymmetry: number;
  confidence: number;
  valid: boolean;
}

export interface SquatAnalysisResult {
  engineVersion: typeof SQUAT_ANALYSIS_ENGINE_VERSION;
  framesAnalyzed: number;
  framesValid: number;
  validFrameRatio: number;
  repetitionsDetected: number;
  validRepetitions: number;
  samples: SquatFrameSample[];
  repetitions: SquatRepetitionSummary[];
  events: MotionEvent[];
  metrics: MotionMetric[];
}

function finite(values: number[]): number[] {
  return values.filter(Number.isFinite);
}

function percentile(values: number[], p: number): number {
  const sorted = finite(values).sort((a, b) => a - b);
  if (!sorted.length) return Number.NaN;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (rank - low);
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function repetitionSummary(
  repetition: SquatRepPhase,
  samples: SquatFrameSample[],
  index: number,
): SquatRepetitionSummary {
  const slice = samples.slice(repetition.start, repetition.end + 1);
  const leftAngles = slice.map((sample) => sample.leftKneeAngleDeg);
  const rightAngles = slice.map((sample) => sample.rightKneeAngleDeg);
  const leftRange = percentile(leftAngles, 95) - percentile(leftAngles, 5);
  const rightRange = percentile(rightAngles, 95) - percentile(rightAngles, 5);
  const trunkP95 = percentile(
    slice.map((sample) => sample.trunkInclinationDeg),
    95,
  );
  const leftDeviationP95 = percentile(
    slice.map((sample) => Math.abs(sample.leftKneeFrontalDeviation)),
    95,
  );
  const rightDeviationP95 = percentile(
    slice.map((sample) => Math.abs(sample.rightKneeFrontalDeviation)),
    95,
  );
  const confidence = mean(slice.map((sample) => sample.meanVisibility));
  const denominator = Math.max(leftRange, rightRange, 1e-6);
  const symmetry = 1 - Math.abs(leftRange - rightRange) / denominator;
  const duration = repetition.endSeconds - repetition.startSeconds;
  const descent = repetition.bottomSeconds - repetition.startSeconds;
  const ascent = repetition.endSeconds - repetition.bottomSeconds;
  const valid = confidence >= 0.4 && leftRange + rightRange > 5 && duration >= 0.4;

  return {
    repetition: index + 1,
    startFrame: repetition.start,
    bottomFrame: repetition.bottom,
    endFrame: repetition.end,
    durationSeconds: round(duration, 2),
    descentSeconds: round(descent, 2),
    ascentSeconds: round(ascent, 2),
    leftKneeFlexionRangeDeg: round(leftRange, 1),
    rightKneeFlexionRangeDeg: round(rightRange, 1),
    trunkInclinationP95Deg: round(trunkP95, 1),
    leftKneeFrontalDeviationP95: round(leftDeviationP95, 3),
    rightKneeFrontalDeviationP95: round(rightDeviationP95, 3),
    bilateralSymmetry: round(clamp01(symmetry), 2),
    confidence: round(clamp01(confidence), 2),
    valid,
  };
}

function eventsForRepetition(
  repetition: SquatRepPhase,
  summary: SquatRepetitionSummary,
  frameNumbers: number[],
): MotionEvent[] {
  const metadata = { repetition: summary.repetition, valid: summary.valid };
  return [
    {
      id: `squat-${summary.repetition}-start`,
      type: "MovementStart",
      frameNumber: frameNumbers[repetition.start] ?? repetition.start,
      timestampSeconds: repetition.startSeconds,
      confidence: summary.confidence,
      metadata,
    },
    {
      id: `squat-${summary.repetition}-bottom`,
      type: "PeakFlexion",
      frameNumber: frameNumbers[repetition.bottom] ?? repetition.bottom,
      timestampSeconds: repetition.bottomSeconds,
      confidence: summary.confidence,
      metadata,
    },
    {
      id: `squat-${summary.repetition}-end`,
      type: "MovementEnd",
      frameNumber: frameNumbers[repetition.end] ?? repetition.end,
      timestampSeconds: repetition.endSeconds,
      confidence: summary.confidence,
      metadata,
    },
  ];
}

function aggregateMetrics(repetitions: SquatRepetitionSummary[]): MotionMetric[] {
  const valid = repetitions.filter((repetition) => repetition.valid);
  const source = SQUAT_ANALYSIS_ENGINE_VERSION;
  const metric = (name: string, value: number, unit: string, method: string): MotionMetric => ({
    name,
    value: round(value, 2),
    unit,
    method,
    source,
  });

  return [
    metric("squat.repetitions.detected", repetitions.length, "count", "adaptive-trajectory-hysteresis"),
    metric("squat.repetitions.valid", valid.length, "count", "quality-and-amplitude-gate"),
    metric(
      "squat.duration.mean",
      mean(valid.map((repetition) => repetition.durationSeconds)),
      "s",
      "mean-valid-repetitions",
    ),
    metric(
      "squat.knee_flexion_range.left.mean",
      mean(valid.map((repetition) => repetition.leftKneeFlexionRangeDeg)),
      "deg",
      "p95-minus-p5-valid-repetitions",
    ),
    metric(
      "squat.knee_flexion_range.right.mean",
      mean(valid.map((repetition) => repetition.rightKneeFlexionRangeDeg)),
      "deg",
      "p95-minus-p5-valid-repetitions",
    ),
    metric(
      "squat.trunk_inclination.p95.mean",
      mean(valid.map((repetition) => repetition.trunkInclinationP95Deg)),
      "deg",
      "mean-repetition-p95",
    ),
    metric(
      "squat.bilateral_symmetry.mean",
      mean(valid.map((repetition) => repetition.bilateralSymmetry)),
      "ratio",
      "range-symmetry-valid-repetitions",
    ),
    metric(
      "squat.confidence.mean",
      mean(valid.map((repetition) => repetition.confidence)),
      "ratio",
      "mean-landmark-visibility-valid-repetitions",
    ),
  ];
}

export function analyzeSquatSeries(
  series: MotionSeries,
  detectorOptions: SquatDetectorOptions = DEFAULT_SQUAT_DETECTOR,
): SquatAnalysisResult {
  const sampled = series.frames
    .map((frame) => ({ frame, sample: sampleSquatFrame(frame) }))
    .filter(
      (entry): entry is { frame: MotionSeries["frames"][number]; sample: SquatFrameSample } =>
        entry.sample !== null,
    );

  const samples = sampled.map((entry) => entry.sample);
  const repetitions = detectSquatRepetitions(
    samples.map((sample) => sample.hipMidY),
    samples.map((sample) => sample.timestampSeconds),
    detectorOptions,
  );
  const summaries = repetitions.map((repetition, index) =>
    repetitionSummary(repetition, samples, index),
  );
  const frameNumbers = sampled.map((entry) => entry.frame.frameNumber);
  const events = repetitions.flatMap((repetition, index) =>
    eventsForRepetition(repetition, summaries[index], frameNumbers),
  );
  const framesValid = samples.filter((sample) => sample.valid).length;

  return {
    engineVersion: SQUAT_ANALYSIS_ENGINE_VERSION,
    framesAnalyzed: samples.length,
    framesValid,
    validFrameRatio: samples.length ? round(framesValid / samples.length, 3) : 0,
    repetitionsDetected: summaries.length,
    validRepetitions: summaries.filter((summary) => summary.valid).length,
    samples,
    repetitions: summaries,
    events,
    metrics: aggregateMetrics(summaries),
  };
}

export function enrichSeriesWithSquatAnalysis(
  series: MotionSeries,
  detectorOptions: SquatDetectorOptions = DEFAULT_SQUAT_DETECTOR,
): MotionSeries {
  const analysis = analyzeSquatSeries(series, detectorOptions);
  return {
    ...series,
    events: [...(series.events ?? []), ...analysis.events],
    metrics: [...(series.metrics ?? []), ...analysis.metrics],
  };
}
