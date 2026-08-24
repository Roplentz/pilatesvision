import { describe, expect, it } from "vitest";
import { assessCaptureReadiness } from "./capture-readiness";
import { assessMetricConfidence } from "./metric-confidence";
import { initialSquatState, nextSquatState } from "./squat-state-machine";

describe("capture readiness", () => {
  it("blocks a capture when mandatory conditions fail", () => {
    const result = assessCaptureReadiness(
      {
        bodyCoverage: 0.7,
        landmarkVisibility: 0.95,
        lightingScore: 0.9,
        personCount: 1,
      },
      {
        minimumBodyCoverage: 0.9,
        minimumLandmarkVisibility: 0.8,
        minimumLightingScore: 0.7,
        requiredPersonCount: 1,
      },
    );

    expect(result.status).toBe("blocked");
    expect(result.blockingReasons).toContain("body-coverage");
  });

  it("returns attention for non-blocking quality issues", () => {
    const result = assessCaptureReadiness(
      {
        bodyCoverage: 0.95,
        landmarkVisibility: 0.95,
        lightingScore: 0.5,
        personCount: 1,
      },
      {
        minimumBodyCoverage: 0.9,
        minimumLandmarkVisibility: 0.8,
        minimumLightingScore: 0.7,
        requiredPersonCount: 1,
      },
    );

    expect(result.status).toBe("attention");
    expect(result.warnings).toContain("lighting");
  });
});

describe("squat state machine", () => {
  it("counts a repetition only after the full state sequence", () => {
    const config = {
      minimumConfidence: 0.7,
      standingMaxFlexionDeg: 25,
      bottomMinFlexionDeg: 80,
      movementVelocityThresholdDegPerSecond: 5,
      minimumStateDurationSeconds: 0.1,
    };

    let state = initialSquatState();
    state = nextSquatState(state, { timestampSeconds: 0.2, kneeFlexionDeg: 35, angularVelocityDegPerSecond: 20, confidence: 0.95 }, config);
    expect(state.state).toBe("descending");

    state = nextSquatState(state, { timestampSeconds: 0.4, kneeFlexionDeg: 90, angularVelocityDegPerSecond: 10, confidence: 0.95 }, config);
    expect(state.state).toBe("bottom");

    state = nextSquatState(state, { timestampSeconds: 0.6, kneeFlexionDeg: 80, angularVelocityDegPerSecond: -20, confidence: 0.95 }, config);
    expect(state.state).toBe("ascending");

    state = nextSquatState(state, { timestampSeconds: 0.8, kneeFlexionDeg: 20, angularVelocityDegPerSecond: -10, confidence: 0.95 }, config);
    expect(state.state).toBe("standing");
    expect(state.repetitionCount).toBe(1);
  });

  it("ignores low-confidence frames", () => {
    const state = nextSquatState(
      initialSquatState(),
      { timestampSeconds: 1, kneeFlexionDeg: 50, angularVelocityDegPerSecond: 30, confidence: 0.2 },
      {
        minimumConfidence: 0.7,
        standingMaxFlexionDeg: 25,
        bottomMinFlexionDeg: 80,
        movementVelocityThresholdDegPerSecond: 5,
        minimumStateDurationSeconds: 0.1,
      },
    );

    expect(state.state).toBe("standing");
    expect(state.repetitionCount).toBe(0);
  });
});

describe("metric confidence", () => {
  it("marks a metric unavailable when a declared requirement is missing", () => {
    const result = assessMetricConfidence({
      metricId: "squat.trunk_inclination",
      value: 30,
      sourceConfidence: 0.95,
      captureConfidence: 0.9,
      requirements: [{ id: "shoulders-visible", met: false }],
      minimumConfidence: 0.7,
    });

    expect(result.status).toBe("unavailable");
    expect(result.missingRequirements).toEqual(["shoulders-visible"]);
  });

  it("keeps low-confidence values distinct from unavailable values", () => {
    const result = assessMetricConfidence({
      metricId: "squat.knee_rom",
      value: 92,
      sourceConfidence: 0.6,
      captureConfidence: 0.7,
      minimumConfidence: 0.8,
    });

    expect(result.status).toBe("low-confidence");
    expect(result.value).toBe(92);
    expect(result.confidence).toBeGreaterThan(0);
  });
});
