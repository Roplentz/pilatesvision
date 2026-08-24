import { describe, expect, it } from "vitest";
import {
  FMIP_SCHEMA_VERSION,
  FmipModuleRegistry,
  runAssessmentPipeline,
  type AssessmentEnvelope,
  type AssessmentModule,
} from "./index";

const context = {
  assessmentId: "assessment-1",
  clinicId: "clinic-1",
  protocolId: "fisiohub.squat",
  protocolVersion: "1.0.0",
  capturedAt: "2026-08-02T00:00:00.000Z",
};

function module(id: string, requiredOutput: unknown, throws = false): AssessmentModule {
  return {
    id,
    version: "1.0.0",
    domain: "pilates",
    stage: "quality",
    status: "experimental",
    run: () => {
      if (throws) throw new Error("expected failure");
      return requiredOutput;
    },
  };
}

describe("FMIP foundation", () => {
  it("registers and resolves modules by domain, stage and id", () => {
    const registry = new FmipModuleRegistry();
    const quality = module("quality-gate", { accepted: true });
    registry.register(quality);
    expect(registry.require("pilates", "quality", "quality-gate")).toBe(quality);
  });

  it("keeps optional failures as warnings", async () => {
    const envelope: AssessmentEnvelope = {
      schemaVersion: FMIP_SCHEMA_VERSION,
      domain: "pilates",
      context,
      payload: { frames: 20 },
      provenance: [],
      warnings: [],
    };

    const result = await runAssessmentPipeline(envelope, [
      { stage: "quality", module: module("optional-quality", null, true), required: false },
      {
        stage: "motion",
        module: { ...module("motion", { reps: 3 }), stage: "motion" },
        required: true,
      },
    ]);

    expect(result.payload).toEqual({ reps: 3 });
    expect(result.warnings).toHaveLength(1);
    expect(result.provenance).toHaveLength(2);
  });

  it("stops when a required module fails", async () => {
    const envelope: AssessmentEnvelope = {
      schemaVersion: FMIP_SCHEMA_VERSION,
      domain: "pilates",
      context,
      payload: {},
      provenance: [],
      warnings: [],
    };

    await expect(
      runAssessmentPipeline(envelope, [
        { stage: "quality", module: module("required-quality", null, true), required: true },
      ]),
    ).rejects.toThrow("expected failure");
  });
});
