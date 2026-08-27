import { describe, expect, it } from "vitest";
import {
  derivative,
  emaZeroPhase,
  evaluateMotionQuality,
  interpolateInvalid,
  jointAngleDeg,
  type MotionFrame,
} from "./index";

const point = (name: string, x: number, y: number) => ({ name, x, y });

describe("motion-core geometry", () => {
  it("calculates a right angle", () => {
    expect(jointAngleDeg(point("A", 1, 0), point("B", 0, 0), point("C", 0, 1))).toBeCloseTo(90);
  });
});

describe("motion-core temporal", () => {
  it("interpolates invalid samples", () => {
    expect(interpolateInvalid([0, Number.NaN, 2])).toEqual([0, 1, 2]);
  });

  it("produces finite smoothed values", () => {
    expect(emaZeroPhase([0, 1, Number.NaN, 3]).every(Number.isFinite)).toBe(true);
  });

  it("calculates a constant derivative", () => {
    expect(derivative([0, 1, 2], 1)).toEqual([1, 1, 1]);
  });
});

describe("motion-core quality gate", () => {
  it("rejects an empty capture", () => {
    expect(evaluateMotionQuality([]).level).toBe("invalid");
  });

  it("accepts a visible tracked series", () => {
    const frames: MotionFrame[] = Array.from({ length: 12 }, (_, frameNumber) => ({
      frameNumber,
      timestampSeconds: frameNumber / 30,
      landmarks: [point("HIP", 0.5, 0.5)],
      meanConfidence: 0.9,
    }));
    expect(["excellent", "good", "acceptable"]).toContain(evaluateMotionQuality(frames).level);
  });
});
