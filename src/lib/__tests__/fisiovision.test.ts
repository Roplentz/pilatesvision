import { describe, expect, it } from "vitest";
import {
  FISIOVISION_ALLOWED_EXERCISES,
  FISIOVISION_EXERCISE_LABELS,
  translateFisiovisionError,
} from "@/lib/fisiovision.types";
import { makeIdempotencyKey } from "@/lib/fisiovision.functions";

describe("fisiovision integration contract", () => {
  it("libera exatamente os cinco exercícios validados", () => {
    expect([...FISIOVISION_ALLOWED_EXERCISES].sort()).toEqual(
      [
        "pilates-swan",
        "pilates-swimming",
        "pilates-single-leg-stretch",
        "pilates-teaser",
        "pilates-the-hundred",
      ].sort(),
    );
  });

  it("tem rótulo humano para cada exercício", () => {
    for (const id of FISIOVISION_ALLOWED_EXERCISES)
      expect(FISIOVISION_EXERCISE_LABELS[id]).toBeTruthy();
  });

  it("gera idempotência estável, opaca e dentro do limite da API", async () => {
    const longPath = `clinic/patient/assessment/${"video-com-nome-longo-".repeat(20)}.mp4`;
    const first = await makeIdempotencyKey("user-1", longPath, "pilates-teaser");
    const repeated = await makeIdempotencyKey("user-1", longPath, "pilates-teaser");
    const otherExercise = await makeIdempotencyKey("user-1", longPath, "pilates-swan");
    expect(first).toBe(repeated);
    expect(first).not.toBe(otherExercise);
    expect(first).toMatch(/^pv:[a-f0-9]{64}$/);
    expect(first.length).toBeLessThanOrEqual(128);
    expect(first).not.toContain(longPath);
  });

  it("traduz códigos de erro conhecidos para PT-BR", () => {
    expect(translateFisiovisionError("rate_limited")).toMatch(/análises/i);
    expect(translateFisiovisionError("service_unavailable")).toMatch(/indisponível/i);
    expect(translateFisiovisionError("config_missing")).toMatch(/não configurada/i);
    expect(translateFisiovisionError("forbidden")).toMatch(/permissão/i);
    expect(translateFisiovisionError("invalid_video")).toMatch(/vídeo/i);
    expect(translateFisiovisionError(undefined)).toMatch(/falha/i);
  });
});
