import { describe, expect, it } from "vitest";
import { assertPoseAdapterMetadata } from "./adapters/pose-adapter";
import { createEvidenceRegistry, findMetricEvidence } from "./evidence";
import { validateProtocolContext } from "./protocols/protocol";

describe("motion-core engineering contracts", () => {
  it("accepts valid pose adapter metadata", () => {
    expect(() =>
      assertPoseAdapterMetadata({
        engine: "mediapipe",
        model: "pose-landmarker-lite",
        version: "0.10.35",
        coordinateSystem: "normalized",
        landmarkSet: "mediapipe-pose-33",
        landmarkCount: 33,
        runsOnDevice: true,
        supportsMultiplePeople: false,
        license: "Apache-2.0",
      }),
    ).not.toThrow();
  });

  it("rejects invalid landmark counts", () => {
    expect(() =>
      assertPoseAdapterMetadata({
        engine: "test",
        model: "test",
        version: "1.0.0",
        coordinateSystem: "normalized",
        landmarkSet: "test",
        landmarkCount: 0,
        runsOnDevice: true,
        supportsMultiplePeople: false,
      }),
    ).toThrow("pose_adapter_landmark_count_invalid");
  });

  it("creates an evidence registry with limitations", () => {
    const registry = createEvidenceRegistry("1.0.0", [
      {
        metricId: "squat.knee_flexion_range.left",
        displayName: "Amplitude de flexão do joelho esquerdo",
        definition: "Diferença entre o maior e o menor ângulo do joelho na repetição.",
        unit: "deg",
        requiredCapturePlane: "sagittal",
        requiredQualityLevel: "acceptable",
        references: [],
        algorithmVersion: "0.1.0",
        evidenceLevel: "experimental",
        limitations: ["Estimativa 2D dependente do plano da câmera."],
      },
    ]);

    expect(findMetricEvidence(registry, "squat.knee_flexion_range.left")?.unit).toBe("deg");
  });

  it("validates protocol capture requirements", () => {
    expect(() =>
      validateProtocolContext({
        protocolId: "fisiohub.squat",
        protocolVersion: "1.0.0",
        exercise: "squat",
        captureRequirements: {
          allowedPlanes: ["sagittal"],
          minimumValidFrameRatio: 0.8,
          maximumPeople: 1,
        },
      }),
    ).not.toThrow();
  });
});
