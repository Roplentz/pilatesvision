import { describe, expect, it } from "vitest";
import { mediaPipeFrameToMotionFrame } from "../adapters/mediapipe";
import {
  DEFAULT_SQUAT_DETECTOR,
  detectSquatRepetitions,
  sampleSquatFrame,
} from "./squat";
import {
  DEFAULT_DETECTOR,
  detectReps,
  sampleFromLandmarks,
  type Landmark,
} from "../../../../src/lib/poseMetrics";

function makePose(): Landmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));
  landmarks[11] = { x: 0.42, y: 0.2, visibility: 0.9 };
  landmarks[12] = { x: 0.58, y: 0.2, visibility: 0.9 };
  landmarks[23] = { x: 0.44, y: 0.5, visibility: 0.9 };
  landmarks[24] = { x: 0.56, y: 0.5, visibility: 0.9 };
  landmarks[25] = { x: 0.42, y: 0.7, visibility: 0.9 };
  landmarks[26] = { x: 0.58, y: 0.7, visibility: 0.9 };
  landmarks[27] = { x: 0.44, y: 0.9, visibility: 0.9 };
  landmarks[28] = { x: 0.56, y: 0.9, visibility: 0.9 };
  return landmarks;
}

describe("Squat biomechanics equivalence", () => {
  it("matches the current PilatesVision frame sampler", () => {
    const landmarks = makePose();
    const legacy = sampleFromLandmarks(landmarks, 1.25);
    const frame = mediaPipeFrameToMotionFrame({
      frameNumber: 10,
      timestampSeconds: 1.25,
      landmarks,
    });
    const core = sampleSquatFrame(frame);

    expect(core).not.toBeNull();
    expect(legacy).not.toBeNull();
    expect(core?.leftKneeAngleDeg).toBeCloseTo(legacy?.kneeAngleL ?? 0, 10);
    expect(core?.rightKneeAngleDeg).toBeCloseTo(legacy?.kneeAngleR ?? 0, 10);
    expect(core?.leftKneeFrontalDeviation).toBeCloseTo(legacy?.kneeValgusL ?? 0, 10);
    expect(core?.rightKneeFrontalDeviation).toBeCloseTo(legacy?.kneeValgusR ?? 0, 10);
    expect(core?.trunkInclinationDeg).toBeCloseTo(legacy?.trunkInclination ?? 0, 10);
    expect(core?.hipMidY).toBeCloseTo(legacy?.hipMidY ?? 0, 10);
    expect(core?.meanVisibility).toBeCloseTo(legacy?.meanVisibility ?? 0, 10);
    expect(core?.valid).toBe(legacy?.valid);
  });

  it("matches the current repetition detector", () => {
    const hipY = [0.4, 0.4, 0.42, 0.48, 0.58, 0.68, 0.62, 0.52, 0.44, 0.4, 0.4];
    const times = hipY.map((_, index) => index * 0.1);

    const legacy = detectReps(hipY, times, DEFAULT_DETECTOR);
    const core = detectSquatRepetitions(hipY, times, DEFAULT_SQUAT_DETECTOR);

    expect(core).toHaveLength(legacy.length);
    expect(core.map((rep) => [rep.start, rep.bottom, rep.end])).toEqual(
      legacy.map((rep) => [rep.start, rep.bottom, rep.end]),
    );
    expect(core.map((rep) => [rep.startSeconds, rep.bottomSeconds, rep.endSeconds])).toEqual(
      legacy.map((rep) => [rep.tStart, rep.tBottom, rep.tEnd]),
    );
  });

  it("returns no repetition when trajectory variation is insufficient", () => {
    const hipY = Array.from({ length: 20 }, () => 0.5);
    const times = hipY.map((_, index) => index / 30);
    expect(detectSquatRepetitions(hipY, times)).toEqual([]);
  });

  it("returns null when required anatomical landmarks are absent", () => {
    const frame = mediaPipeFrameToMotionFrame({
      frameNumber: 0,
      timestampSeconds: 0,
      landmarks: makePose(),
    });
    frame.landmarks = frame.landmarks.filter((landmark) => landmark.name !== "LEFT_KNEE");
    expect(sampleSquatFrame(frame)).toBeNull();
  });
});
