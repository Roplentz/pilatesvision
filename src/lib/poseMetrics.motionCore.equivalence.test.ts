import { describe, expect, it } from "vitest";
import {
  emaSmoothZeroPhase as legacyEmaZeroPhase,
  interpolateInvalid as legacyInterpolateInvalid,
  mean as legacyMean,
  sampleFromLandmarks,
  type Landmark as LegacyLandmark,
} from "./poseMetrics";
import {
  emaZeroPhase as coreEmaZeroPhase,
  interpolateInvalid as coreInterpolateInvalid,
  jointAngleDeg,
  mean as coreMean,
  mediaPipeFrameToMotionFrame,
  type MotionLandmark,
} from "../../packages/motion-core/src";

function expectArraysClose(actual: number[], expected: number[], precision = 10): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    if (Number.isNaN(expected[index])) expect(Number.isNaN(value)).toBe(true);
    else expect(value).toBeCloseTo(expected[index], precision);
  });
}

function makePose(): LegacyLandmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95,
  }));

  landmarks[11] = { x: 0.4, y: 0.2, visibility: 0.95 }; // left shoulder
  landmarks[12] = { x: 0.6, y: 0.2, visibility: 0.95 }; // right shoulder
  landmarks[23] = { x: 0.42, y: 0.5, visibility: 0.95 }; // left hip
  landmarks[24] = { x: 0.58, y: 0.5, visibility: 0.95 }; // right hip
  landmarks[25] = { x: 0.4, y: 0.7, visibility: 0.95 }; // left knee
  landmarks[26] = { x: 0.6, y: 0.7, visibility: 0.95 }; // right knee
  landmarks[27] = { x: 0.44, y: 0.9, visibility: 0.95 }; // left ankle
  landmarks[28] = { x: 0.56, y: 0.9, visibility: 0.95 }; // right ankle

  return landmarks;
}

function findLandmark(landmarks: MotionLandmark[], name: string): MotionLandmark {
  const landmark = landmarks.find((item) => item.name === name);
  if (!landmark) throw new Error(`Missing landmark ${name}`);
  return landmark;
}

describe("poseMetrics ↔ FisioHub Motion Core equivalence", () => {
  it("preserves the legacy mean behavior for finite and invalid values", () => {
    const cases = [
      [1, 2, 3, 4],
      [1, Number.NaN, 3, Number.POSITIVE_INFINITY],
      [],
    ];

    for (const values of cases) {
      const legacy = legacyMean(values);
      const core = coreMean(values);
      if (Number.isNaN(legacy)) expect(Number.isNaN(core)).toBe(true);
      else expect(core).toBeCloseTo(legacy, 12);
    }
  });

  it("produces the same interpolation at initial, internal and terminal gaps", () => {
    const cases = [
      [Number.NaN, 2, 4],
      [1, Number.NaN, Number.NaN, 4],
      [1, 2, Number.NaN, Number.NaN],
      [Number.NaN, Number.NaN],
      [],
    ];

    for (const values of cases) {
      expectArraysClose(coreInterpolateInvalid(values), legacyInterpolateInvalid(values));
    }
  });

  it("produces the same zero-phase EMA used by the MVP", () => {
    const signals = [
      [0, 1, 2, 3, 4, 3, 2, 1, 0],
      [1, Number.NaN, 2, 5, Number.NaN, 3],
      [4],
      [],
    ];

    for (const signal of signals) {
      for (const alpha of [0.1, 0.3, 0.7, 1]) {
        expectArraysClose(coreEmaZeroPhase(signal, alpha), legacyEmaZeroPhase(signal, alpha));
      }
    }
  });

  it("preserves left and right knee angles after MediaPipe adaptation", () => {
    const landmarks = makePose();
    const legacySample = sampleFromLandmarks(landmarks, 0.25);
    expect(legacySample).not.toBeNull();

    const frame = mediaPipeFrameToMotionFrame({
      frameNumber: 5,
      timestampSeconds: 0.25,
      landmarks,
    });

    const leftAngle = jointAngleDeg(
      findLandmark(frame.landmarks, "LEFT_HIP"),
      findLandmark(frame.landmarks, "LEFT_KNEE"),
      findLandmark(frame.landmarks, "LEFT_ANKLE"),
    );
    const rightAngle = jointAngleDeg(
      findLandmark(frame.landmarks, "RIGHT_HIP"),
      findLandmark(frame.landmarks, "RIGHT_KNEE"),
      findLandmark(frame.landmarks, "RIGHT_ANKLE"),
    );

    expect(leftAngle).toBeCloseTo(legacySample!.kneeAngleL, 12);
    expect(rightAngle).toBeCloseTo(legacySample!.kneeAngleR, 12);
    expect(frame.meanConfidence).toBeCloseTo(legacySample!.meanVisibility, 12);
  });

  it("does not mutate source arrays during temporal processing", () => {
    const signal = [1, Number.NaN, 3, 4];
    const snapshot = [...signal];

    coreInterpolateInvalid(signal);
    coreEmaZeroPhase(signal, 0.3);

    expect(signal).toEqual(snapshot);
  });
});
