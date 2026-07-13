import { describe, it, expect } from "vitest";
import {
  FISIOVISION_ALLOWED_EXERCISES,
  FISIOVISION_EXERCISE_LABELS,
  translateFisiovisionError,
} from "@/lib/fisiovision.types";

describe("fisiovision integration contract", () => {
  it("libera exatamente os cinco exercícios do MVP", () => {
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

  it("tem rótulo humano para cada exercício liberado", () => {
    for (const id of FISIOVISION_ALLOWED_EXERCISES) {
      expect(FISIOVISION_EXERCISE_LABELS[id]).toBeTruthy();
    }
  });

  it("traduz códigos de erro conhecidos para PT-BR", () => {
    expect(translateFisiovisionError("rate_limited")).toMatch(/análises/i);
    expect(translateFisiovisionError("service_unavailable")).toMatch(/indisponível/i);
    expect(translateFisiovisionError("config_missing")).toMatch(/não configurada/i);
    expect(translateFisiovisionError("forbidden")).toMatch(/permissão/i);
    expect(translateFisiovisionError(undefined)).toMatch(/falha/i);
    expect(translateFisiovisionError("codigo_desconhecido")).toMatch(/falha/i);
  });
});