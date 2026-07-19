import type { MotionFrame, MotionQuality, MotionQualityLevel } from "./schema";

export interface QualityGateOptions {
  minimumMeanVisibility: number;
  maximumTrackingLossRatio: number;
  minimumFrames: number;
}

export const DEFAULT_QUALITY_GATE: QualityGateOptions = {
  minimumMeanVisibility: 0.5,
  maximumTrackingLossRatio: 0.2,
  minimumFrames: 12,
};

function levelFromScore(score: number): MotionQualityLevel {
  if (score >= 0.9) return "excellent";
  if (score >= 0.75) return "good";
  if (score >= 0.6) return "acceptable";
  if (score >= 0.4) return "poor";
  return "invalid";
}

export function evaluateMotionQuality(
  frames: MotionFrame[],
  options: QualityGateOptions = DEFAULT_QUALITY_GATE,
): MotionQuality {
  const reasons: string[] = [];
  const visibilityValues = frames
    .map((frame) => frame.meanConfidence)
    .filter((value): value is number => Number.isFinite(value));
  const meanVisibility = visibilityValues.length
    ? visibilityValues.reduce((sum, value) => sum + value, 0) / visibilityValues.length
    : 0;
  const lostFrames = frames.filter((frame) => !frame.landmarks.length || (frame.meanConfidence ?? 0) <= 0).length;
  const trackingLossRatio = frames.length ? lostFrames / frames.length : 1;

  if (frames.length < options.minimumFrames) reasons.push("insufficient_frames");
  if (meanVisibility < options.minimumMeanVisibility) reasons.push("low_visibility");
  if (trackingLossRatio > options.maximumTrackingLossRatio) reasons.push("tracking_loss");

  const frameScore = Math.min(1, frames.length / options.minimumFrames);
  const visibilityScore = Math.min(1, meanVisibility / options.minimumMeanVisibility);
  const trackingScore = Math.max(0, 1 - trackingLossRatio);
  const score = Math.max(0, Math.min(1, frameScore * 0.2 + visibilityScore * 0.5 + trackingScore * 0.3));
  const level = reasons.includes("insufficient_frames") || reasons.includes("tracking_loss")
    ? score < 0.6 ? "invalid" : levelFromScore(score)
    : levelFromScore(score);

  return { level, score, meanVisibility, trackingLossRatio, reasons };
}

export function canInterpretClinically(quality: MotionQuality): boolean {
  return quality.level !== "invalid" && quality.level !== "poor";
}
