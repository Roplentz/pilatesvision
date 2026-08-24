import { describe, expect, it } from "vitest";
import { sampleFromLandmarks, summarizeSamples, type Landmark } from "./poseMetrics";
import { compareLegacyWithFmipShadow, type FmipShadowFrame } from "./fmipShadow";

function landmarksForHipY(hipY: number): Landmark[] {
  const landmarks = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.95,
  }));
  const depth = Math.max(0, Math.min(1, (hipY - 0.4) / 0.2));
  const offset = depth * 0.12;
  landmarks[11] = { x: 0.4, y: 0.2, visibility: 0.95 };
  landmarks[12] = { x: 0.6, y: 0.2, visibility: 0.95 };
  landmarks[23] = { x: 0.42 - offset, y: hipY, visibility: 0.95 };
  landmarks[24] = { x: 0.58 + offset, y: hipY, visibility: 0.95 };
  landmarks[25] = { x: 0.42, y: 0.68, visibility: 0.95 };
  landmarks[26] = { x: 0.58, y: 0.68, visibility: 0.95 };
  landmarks[27] = { x: 0.42, y: 0.9, visibility: 0.95 };
  landmarks[28] = { x: 0.58, y: 0.9, visibility: 0.95 };
  return landmarks;
}

function buildFixture() {
  const trajectory = [
    0.4, 0.4, 0.4, 0.42, 0.45, 0.49, 0.53, 0.57, 0.59, 0.6, 0.59, 0.57, 0.53, 0.49, 0.45, 0.42, 0.4,
    0.4, 0.4, 0.4, 0.4,
  ];
  const frames: FmipShadowFrame[] = trajectory.map((hipY, frameNumber) => ({
    frameNumber,
    timestampSeconds: frameNumber / 10,
    landmarks: landmarksForHipY(hipY),
  }));
  const samples = frames
    .map((frame) => sampleFromLandmarks(frame.landmarks, frame.timestampSeconds))
    .filter((sample): sample is NonNullable<typeof sample> => sample !== null);
  const legacy = summarizeSamples(samples, 2, "squat");
  return { frames, legacy };
}

describe("FMIP shadow comparison", () => {
  it("reports equivalence when Motion Core preserves legacy squat behavior", () => {
    const { frames, legacy } = buildFixture();
    const report = compareLegacyWithFmipShadow(frames, 10, legacy);

    expect(report.status).toBe("equivalent");
    expect(report.deltas.repetitionsDetected).toBe(0);
    expect(report.deltas.validRepetitions).toBe(0);
    expect(report.reasons).toEqual([]);
  });

  it("reports divergence without modifying the legacy summary", () => {
    const { frames, legacy } = buildFixture();
    const originalTotal = legacy.reps_total;
    legacy.reps_total += 1;

    const report = compareLegacyWithFmipShadow(frames, 10, legacy);

    expect(report.status).toBe("divergent");
    expect(report.reasons).toContain("repetition_count_delta");
    expect(legacy.reps_total).toBe(originalTotal + 1);
  });

  it("stays unavailable outside the squat context", () => {
    const { frames, legacy } = buildFixture();
    const pilatesLegacy = { ...legacy, context: "pilates" as const };
    const report = compareLegacyWithFmipShadow(frames, 10, pilatesLegacy);

    expect(report.status).toBe("unavailable");
    expect(report.reasons).toContain("unsupported_context");
  });
});
