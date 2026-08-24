import { describe, expect, it } from "vitest";
import type { MotionFrame, MotionLandmark, MotionSeries } from "../schema";
import { analyzeSquatSeries, enrichSeriesWithSquatAnalysis } from "./squat-analysis";

function landmark(name: string, x: number, y: number): MotionLandmark {
  return { name, x, y, visibility: 0.95, confidence: 0.95 };
}

function frame(frameNumber: number, timestampSeconds: number, hipY: number): MotionFrame {
  const kneeY = hipY + 0.18;
  const ankleY = hipY + 0.38;
  return {
    frameNumber,
    timestampSeconds,
    landmarks: [
      landmark("LEFT_SHOULDER", 0.42, hipY - 0.25),
      landmark("RIGHT_SHOULDER", 0.58, hipY - 0.25),
      landmark("LEFT_HIP", 0.44, hipY),
      landmark("RIGHT_HIP", 0.56, hipY),
      landmark("LEFT_KNEE", 0.43, kneeY),
      landmark("RIGHT_KNEE", 0.57, kneeY),
      landmark("LEFT_ANKLE", 0.42, ankleY),
      landmark("RIGHT_ANKLE", 0.58, ankleY),
    ],
    meanConfidence: 0.95,
  };
}

function squatSeries(): MotionSeries {
  const trajectory = [0.4, 0.4, 0.42, 0.5, 0.62, 0.7, 0.62, 0.5, 0.42, 0.4];
  return {
    samplingRateHz: 10,
    durationSeconds: 0.9,
    coordinateSystem: "normalized",
    frames: trajectory.map((hipY, index) => frame(index + 100, index / 10, hipY)),
  };
}

const detector = {
  emaAlpha: 1,
  minimumTrajectoryRange: 0.02,
  peakRatio: 0.5,
  releaseRatio: 0.2,
  minimumRepSeconds: 0.4,
  maximumRepSeconds: 6,
};

describe("SquatAnalysisEngine", () => {
  it("analyzes a complete MotionSeries and emits standardized events", () => {
    const result = analyzeSquatSeries(squatSeries(), detector);

    expect(result.framesAnalyzed).toBe(10);
    expect(result.framesValid).toBe(10);
    expect(result.repetitionsDetected).toBe(1);
    expect(result.events.map((event) => event.type)).toEqual([
      "MovementStart",
      "PeakFlexion",
      "MovementEnd",
    ]);
    expect(result.events[0].frameNumber).toBeGreaterThanOrEqual(100);
    expect(result.events[1].timestampSeconds).toBeCloseTo(0.5);
  });

  it("returns repetition summaries and schema-compatible aggregate metrics", () => {
    const result = analyzeSquatSeries(squatSeries(), detector);
    const repetition = result.repetitions[0];

    expect(repetition.durationSeconds).toBeGreaterThanOrEqual(0.4);
    expect(repetition.confidence).toBeCloseTo(0.95);
    expect(repetition.bilateralSymmetry).toBeCloseTo(1);
    expect(result.metrics.some((metric) => metric.name === "squat.repetitions.detected")).toBe(
      true,
    );
    expect(result.metrics.some((metric) => metric.name === "squat.confidence.mean")).toBe(true);
    expect(result.metrics.every((metric) => Number.isFinite(metric.value))).toBe(true);
  });

  it("enriches a series without mutating the input", () => {
    const input = squatSeries();
    const enriched = enrichSeriesWithSquatAnalysis(input, detector);

    expect(input.events).toBeUndefined();
    expect(input.metrics).toBeUndefined();
    expect(enriched.events).toHaveLength(3);
    expect(enriched.metrics?.length).toBeGreaterThan(0);
    expect(enriched.frames).toBe(input.frames);
  });

  it("returns an empty and finite analysis for series without usable frames", () => {
    const empty: MotionSeries = {
      samplingRateHz: 30,
      durationSeconds: 0,
      coordinateSystem: "normalized",
      frames: [],
    };
    const result = analyzeSquatSeries(empty, detector);

    expect(result.repetitionsDetected).toBe(0);
    expect(result.events).toEqual([]);
    expect(result.validFrameRatio).toBe(0);
    expect(result.metrics.every((metric) => Number.isFinite(metric.value))).toBe(true);
  });
});
