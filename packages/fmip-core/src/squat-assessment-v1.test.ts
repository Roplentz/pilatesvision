import { describe, expect, it } from "vitest";
import { calculateCalibrationGap } from "./perception";
import { compareToBaseline } from "./longitudinal";
import { SQUAT_ASSESSMENT_V1, assessSquatV1, type SquatAssessmentV1Protocol } from "./squat-assessment-v1";

const protocol: SquatAssessmentV1Protocol = {
  id: SQUAT_ASSESSMENT_V1,
  minimumConfidence: 0.5,
  targets: {
    kneeFlexionRangeDeg: { min: 70, max: 120, tolerance: 20 },
    durationSeconds: { min: 1, max: 5, tolerance: 1 },
    trunkInclinationP95Deg: { max: 45, tolerance: 20 },
    bilateralDifferenceDeg: { max: 10, tolerance: 10 },
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

describe("Squat Assessment v1", () => {
  it("scores explicit protocol targets without hidden normative defaults", () => {
    const result = assessSquatV1([
      {
        repetitionId: "rep-1",
        valid: true,
        confidence: 0.92,
        kneeFlexionRangeLeftDeg: 92,
        kneeFlexionRangeRightDeg: 95,
        durationSeconds: 2.4,
        trunkInclinationP95Deg: 30,
        bilateralDifferenceDeg: 3,
        smoothnessScore: 88,
        compensationScore: 90,
      },
    ], protocol);

    expect(result.status).toBe("valid");
    expect(result.validRepetitions).toBe(1);
    expect(result.overallQuality).toBeGreaterThan(90);
    expect(result.repetitions[0].quality.coverage).toBe(1);
  });

  it("degrades gracefully when optional dimensions are unavailable", () => {
    const result = assessSquatV1([
      {
        repetitionId: "rep-1",
        valid: true,
        confidence: 0.9,
        kneeFlexionRangeLeftDeg: 90,
        kneeFlexionRangeRightDeg: 91,
        durationSeconds: 2,
      },
    ], protocol);

    expect(result.status).toBe("partial");
    expect(result.repetitions[0].quality.coverage).toBeLessThan(1);
    expect(result.repetitions[0].quality.overall).toBeDefined();
  });

  it("attaches patient perception calibration without turning it into diagnosis", () => {
    const result = assessSquatV1([
      {
        repetitionId: "rep-1",
        valid: true,
        confidence: 0.95,
        kneeFlexionRangeLeftDeg: 90,
        kneeFlexionRangeRightDeg: 90,
        durationSeconds: 2,
        trunkInclinationP95Deg: 25,
        bilateralDifferenceDeg: 2,
        smoothnessScore: 95,
        compensationScore: 95,
        perception: { perceivedQuality: 60, confidence: 0.8 },
      },
    ], protocol);

    expect(result.repetitions[0].calibration?.status).toBe("underconfident");
  });
});

describe("Perception and longitudinal contracts", () => {
  it("classifies overconfidence descriptively", () => {
    expect(calculateCalibrationGap(60, { perceivedQuality: 90, confidence: 0.9 }).status).toBe("overconfident");
  });

  it("compares current metrics with a versioned baseline", () => {
    const changes = compareToBaseline(
      {
        protocolId: "squat",
        protocolVersion: "1.0.0",
        capturedAt: "2026-01-01T00:00:00Z",
        metrics: [{ metricId: "knee_rom", value: 80, confidence: 0.9 }],
      },
      [{ metricId: "knee_rom", value: 92, confidence: 0.8 }],
    );

    expect(changes[0].absoluteChange).toBe(12);
    expect(changes[0].percentChange).toBe(15);
    expect(changes[0].confidence).toBe(0.8);
  });
});
