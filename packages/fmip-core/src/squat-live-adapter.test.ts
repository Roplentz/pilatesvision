import { describe, expect, it } from "vitest";
import type {
  MediaPipeFrameInput,
  MediaPipeLandmarkLike,
} from "../../motion-core/src";
import {
  SQUAT_ASSESSMENT_V1,
  type SquatAssessmentV1Protocol,
} from "./squat-assessment-v1";
import { runExperimentalSquatLiveAdapter } from "./squat-live-adapter";
import type { SquatStateMachineConfig } from "./squat-state-machine";

const assessmentProtocol: SquatAssessmentV1Protocol = {
  id: SQUAT_ASSESSMENT_V1,
  minimumConfidence: 0.5,
  targets: {
    kneeFlexionRangeDeg: { min: 30, max: 100, tolerance: 20 },
    durationSeconds: { min: 0.5, max: 4, tolerance: 1 },
    trunkInclinationP95Deg: { max: 45, tolerance: 20 },
    bilateralDifferenceDeg: { max: 15, tolerance: 10 },
  },
  weights: {
    geometric: 3,
    temporal: 1,
    symmetry: 2,
    smoothness: 1,
    compensation: 2,
    completeness: 1,
  },
};

const stateMachineConfig: SquatStateMachineConfig = {
  minimumConfidence: 0.5,
  standingMaxFlexionDeg: 15,
  bottomMinFlexionDeg: 45,
  movementVelocityThresholdDegPerSecond: 5,
  minimumStateDurationSeconds: 0.05,
};

function landmarksForSquat(hipY: number, visibility = 0.95): MediaPipeLandmarkLike[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility,
  }));
  const depth = Math.max(0, Math.min(1, (hipY - 0.4) / 0.2));
  const hipOffset = depth * 0.12;

  landmarks[11] = { x: 0.4, y: 0.2, z: 0, visibility };
  landmarks[12] = { x: 0.6, y: 0.2, z: 0, visibility };
  landmarks[23] = { x: 0.42 - hipOffset, y: hipY, z: 0, visibility };
  landmarks[24] = { x: 0.58 + hipOffset, y: hipY, z: 0, visibility };
  landmarks[25] = { x: 0.42, y: 0.68, z: 0, visibility };
  landmarks[26] = { x: 0.58, y: 0.68, z: 0, visibility };
  landmarks[27] = { x: 0.42, y: 0.9, z: 0, visibility };
  landmarks[28] = { x: 0.58, y: 0.9, z: 0, visibility };

  return landmarks;
}

function squatFrames(visibility = 0.95): MediaPipeFrameInput[] {
  const hipTrajectory = [
    0.4,
    0.4,
    0.4,
    0.42,
    0.45,
    0.49,
    0.53,
    0.57,
    0.59,
    0.6,
    0.59,
    0.57,
    0.53,
    0.49,
    0.45,
    0.42,
    0.4,
    0.4,
    0.4,
    0.4,
    0.4,
  ];

  return hipTrajectory.map((hipY, frameNumber) => ({
    frameNumber,
    timestampSeconds: frameNumber / 10,
    landmarks: landmarksForSquat(hipY, visibility),
  }));
}

describe("experimental squat live adapter", () => {
  it("runs real-shaped MediaPipe landmarks through readiness, motion analysis and Squat v1", () => {
    const result = runExperimentalSquatLiveAdapter({
      mediaPipe: { samplingRateHz: 10, frames: squatFrames() },
      readinessProtocol: {
        minimumBodyCoverage: 0.9,
        minimumLandmarkVisibility: 0.6,
        requiredPersonCount: 1,
        minimumDurationSeconds: 1,
      },
      assessmentProtocol,
      stateMachineConfig,
      capture: { personCount: 1 },
    });

    expect(result.status).toBe("analyzed");
    expect(result.readiness.status).toBe("ready");
    expect(result.motionSeries.frames).toHaveLength(21);
    expect(result.analysis).toBeDefined();
    expect(result.analysis!.repetitionsDetected).toBeGreaterThan(0);
    expect(result.assessment).toBeDefined();
    expect(result.assessment!.totalRepetitions).toBe(result.analysis!.repetitionsDetected);
    expect(result.stateTrace.length).toBeGreaterThan(0);
  });

  it("blocks analysis when landmark visibility fails the capture protocol", () => {
    const result = runExperimentalSquatLiveAdapter({
      mediaPipe: { samplingRateHz: 10, frames: squatFrames(0.2) },
      readinessProtocol: {
        minimumBodyCoverage: 0.9,
        minimumLandmarkVisibility: 0.6,
      },
      assessmentProtocol,
      stateMachineConfig,
    });

    expect(result.status).toBe("blocked");
    expect(result.readiness.blockingReasons).toContain("landmark-visibility");
    expect(result.analysis).toBeUndefined();
    expect(result.assessment).toBeUndefined();
  });
});
