import { describe, expect, it } from "vitest";
import { runMotionCoreShadow } from "@/lib/motionCoreShadow";
import type { RawFrame } from "@/lib/fisiohub-motion-core";
import { summarizeSamples, sampleFromLandmarks, type Landmark } from "@/lib/poseMetrics";

function synthLandmarks(hipY: number, kneeAngle: number): Landmark[] {
  const lms: Landmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0.9,
  }));
  lms[0] = { x: 0.5, y: 0.15, visibility: 0.95 };
  lms[11] = { x: 0.42, y: 0.3, visibility: 0.9 };
  lms[12] = { x: 0.58, y: 0.3, visibility: 0.9 };
  lms[23] = { x: 0.44, y: hipY, visibility: 0.9 };
  lms[24] = { x: 0.56, y: hipY, visibility: 0.9 };
  const seg = 0.18;
  const half = ((180 - kneeAngle) / 2) * (Math.PI / 180);
  const kneeDx = seg * Math.sin(half);
  const kneeDy = seg * Math.cos(half);
  lms[25] = { x: 0.44 - kneeDx, y: hipY + kneeDy, visibility: 0.9 };
  lms[26] = { x: 0.56 + kneeDx, y: hipY + kneeDy, visibility: 0.9 };
  lms[27] = { x: 0.44, y: hipY + 2 * kneeDy, visibility: 0.9 };
  lms[28] = { x: 0.56, y: hipY + 2 * kneeDy, visibility: 0.9 };
  return lms;
}

function synthFrames(reps: number, framesPerRep = 24): RawFrame[] {
  const frames: RawFrame[] = [];
  const total = reps > 0 ? reps * framesPerRep : framesPerRep;
  const baseY = 0.42;
  const depth = 0.1;
  for (let i = 0; i < total; i++) {
    const phase = reps > 0 ? (i % framesPerRep) / framesPerRep : 0;
    const y = reps > 0 ? baseY + depth * Math.sin(phase * Math.PI) : baseY;
    const kneeAngle = 170 - ((y - baseY) / depth) * 80;
    frames.push({
      frameNumber: i,
      timestampSeconds: i / 10,
      landmarks: synthLandmarks(y, kneeAngle),
    });
  }
  return frames;
}

describe("runMotionCoreShadow", () => {
  it("retorna disabled quando a flag está desligada", () => {
    const result = runMotionCoreShadow([], null);
    expect(result.status).toBe("disabled");
    expect(result.enabled).toBe(false);
    expect(result.engine).toBe("fisiohub-motion-core");
  });

  it("processa série válida com pelo menos uma repetição e compara com o legado", () => {
    const frames = synthFrames(1, 24);
    const legacySamples = frames
      .map((f) => sampleFromLandmarks(f.landmarks, f.timestampSeconds))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    const legacy = summarizeSamples(
      legacySamples,
      legacySamples[legacySamples.length - 1]?.t ?? 0,
      "squat",
    );
    const result = runMotionCoreShadow(frames, legacy, { forceEnabled: true });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.framesAnalyzed).toBeGreaterThan(10);
    expect(result.repetitionsDetected).toBeGreaterThanOrEqual(1);
    expect(result.comparison.legacyRepsTotal).toBe(legacy.reps_total);
    expect(result.comparison.repsTotalDelta).toBe(result.repetitionsDetected - legacy.reps_total);
    // serializável e sem NaN/Infinity
    const json = JSON.stringify(result);
    expect(json.includes("NaN")).toBe(false);
    expect(json.includes("Infinity")).toBe(false);
  });

  it("falha de forma segura retornando status='error' sem lançar", () => {
    const bogus = [
      {
        frameNumber: 0,
        timestampSeconds: 0,
        landmarks: null as unknown as Landmark[],
      },
    ];
    const result = runMotionCoreShadow(bogus, null, { forceEnabled: true });
    // Ou passa (framesAnalyzed=0) sem lançar, ou reporta erro seguro.
    expect(["ok", "error"]).toContain(result.status);
    expect(result.enabled).toBe(true);
  });

  it("comparação lida com legado nulo sem quebrar", () => {
    const frames = synthFrames(1, 24);
    const result = runMotionCoreShadow(frames, null, { forceEnabled: true });
    if (result.status !== "ok") throw new Error("esperado ok");
    expect(result.comparison.legacyRepsTotal).toBeNull();
    expect(result.comparison.repsTotalDelta).toBeNull();
    expect(result.comparison.shadowRepsTotal).toBe(result.repetitionsDetected);
  });
});
