import { jointAngleDeg, midpoint, segmentInclinationFromVerticalDeg } from "../geometry";
import type { MotionFrame, MotionLandmark } from "../schema";
import { emaZeroPhase, interpolateInvalid, mean } from "../temporal";

export interface SquatFrameSample {
  timestampSeconds: number;
  leftKneeAngleDeg: number;
  rightKneeAngleDeg: number;
  leftKneeFrontalDeviation: number;
  rightKneeFrontalDeviation: number;
  trunkInclinationDeg: number;
  hipMidY: number;
  meanVisibility: number;
  valid: boolean;
}

export interface SquatRepPhase {
  start: number;
  bottom: number;
  end: number;
  startSeconds: number;
  bottomSeconds: number;
  endSeconds: number;
}

export interface SquatDetectorOptions {
  emaAlpha: number;
  minimumTrajectoryRange: number;
  peakRatio: number;
  releaseRatio: number;
  minimumRepSeconds: number;
  maximumRepSeconds: number;
}

export const DEFAULT_SQUAT_DETECTOR: SquatDetectorOptions = {
  emaAlpha: 0.3,
  minimumTrajectoryRange: 0.02,
  peakRatio: 0.5,
  releaseRatio: 0.2,
  minimumRepSeconds: 0.4,
  maximumRepSeconds: 6,
};

function byName(frame: MotionFrame, name: string): MotionLandmark | undefined {
  return frame.landmarks.find((landmark) => landmark.name === name);
}

function percentile(values: number[], p: number): number {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return Number.NaN;
  if (finite.length === 1) return finite[0];
  const rank = (p / 100) * (finite.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return finite[low];
  return finite[low] + (finite[high] - finite[low]) * (rank - low);
}

function frontalDeviation(
  hip: MotionLandmark,
  knee: MotionLandmark,
  ankle: MotionLandmark,
  hipWidth: number,
): number {
  if (hipWidth <= 0) return Number.NaN;
  const verticalSpan = ankle.y - hip.y;
  if (Math.abs(verticalSpan) < 1e-6) return Number.NaN;
  const t = (knee.y - hip.y) / verticalSpan;
  const expectedX = hip.x + t * (ankle.x - hip.x);
  return (knee.x - expectedX) / hipWidth;
}

export function sampleSquatFrame(frame: MotionFrame): SquatFrameSample | null {
  const leftShoulder = byName(frame, "LEFT_SHOULDER");
  const rightShoulder = byName(frame, "RIGHT_SHOULDER");
  const leftHip = byName(frame, "LEFT_HIP");
  const rightHip = byName(frame, "RIGHT_HIP");
  const leftKnee = byName(frame, "LEFT_KNEE");
  const rightKnee = byName(frame, "RIGHT_KNEE");
  const leftAnkle = byName(frame, "LEFT_ANKLE");
  const rightAnkle = byName(frame, "RIGHT_ANKLE");

  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftHip ||
    !rightHip ||
    !leftKnee ||
    !rightKnee ||
    !leftAnkle ||
    !rightAnkle
  ) {
    return null;
  }

  const shouldersMid = midpoint(leftShoulder, rightShoulder, "SHOULDERS_MID");
  const hipsMid = midpoint(leftHip, rightHip, "HIPS_MID");
  const hipWidth = Math.hypot(leftHip.x - rightHip.x, leftHip.y - rightHip.y);
  const keyPoints = [
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    leftKnee,
    rightKnee,
    leftAnkle,
    rightAnkle,
  ];
  const meanVisibility = mean(keyPoints.map((point) => point.visibility ?? 1));

  return {
    timestampSeconds: frame.timestampSeconds,
    leftKneeAngleDeg: jointAngleDeg(leftHip, leftKnee, leftAnkle),
    rightKneeAngleDeg: jointAngleDeg(rightHip, rightKnee, rightAnkle),
    leftKneeFrontalDeviation: frontalDeviation(leftHip, leftKnee, leftAnkle, hipWidth),
    rightKneeFrontalDeviation: frontalDeviation(rightHip, rightKnee, rightAnkle, hipWidth),
    trunkInclinationDeg: segmentInclinationFromVerticalDeg(hipsMid, shouldersMid),
    hipMidY: hipsMid.y,
    meanVisibility,
    valid: meanVisibility >= 0.3,
  };
}

export function detectSquatRepetitions(
  hipMidY: number[],
  timestampsSeconds: number[],
  options: SquatDetectorOptions = DEFAULT_SQUAT_DETECTOR,
): SquatRepPhase[] {
  if (hipMidY.length < 6 || hipMidY.length !== timestampsSeconds.length) return [];

  const trajectory = emaZeroPhase(interpolateInvalid(hipMidY), options.emaAlpha);
  const p5 = percentile(trajectory, 5);
  const p95 = percentile(trajectory, 95);
  const range = p95 - p5;
  if (!Number.isFinite(range) || range < options.minimumTrajectoryRange) return [];

  const baseline = percentile(trajectory, 10);
  const peakThreshold = baseline + options.peakRatio * range;
  const releaseThreshold = baseline + options.releaseRatio * range;
  const repetitions: SquatRepPhase[] = [];

  let phase: "top" | "descent" | "ascent" = "top";
  let startIndex = 0;
  let bottomIndex = 0;
  let bottomValue = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < trajectory.length; index += 1) {
    const value = trajectory[index];
    if (phase === "top") {
      if (value >= peakThreshold) {
        phase = "descent";
        let candidate = index;
        while (
          candidate > 0 &&
          trajectory[candidate - 1] <= releaseThreshold + (peakThreshold - releaseThreshold) * 0.3
        ) {
          candidate -= 1;
        }
        startIndex = candidate;
        bottomIndex = index;
        bottomValue = value;
      }
      continue;
    }

    if (value > bottomValue) {
      bottomValue = value;
      bottomIndex = index;
      phase = "descent";
    } else if (value <= releaseThreshold) {
      const startSeconds = timestampsSeconds[startIndex];
      const bottomSeconds = timestampsSeconds[bottomIndex];
      const endSeconds = timestampsSeconds[index];
      const duration = endSeconds - startSeconds;
      if (duration >= options.minimumRepSeconds && duration <= options.maximumRepSeconds) {
        repetitions.push({
          start: startIndex,
          bottom: bottomIndex,
          end: index,
          startSeconds,
          bottomSeconds,
          endSeconds,
        });
      }
      phase = "top";
      bottomValue = Number.NEGATIVE_INFINITY;
    } else {
      phase = "ascent";
    }
  }

  return repetitions;
}
