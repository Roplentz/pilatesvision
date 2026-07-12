import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");

const CLINICAL_TABLES = [
  "patients",
  "patient_consents",
  "assessments",
  "postural_results",
  "movement_results",
  "exercise_results",
  "prescribed_exercises",
  "reports",
  "pose_captures",
] as const;

function loadAllMigrations(): string {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return files.map((f) => readFileSync(join(MIGRATIONS_DIR, f), "utf8")).join("\n\n");
}

describe("RLS static audit (parses migrations)", () => {
  const sql = loadAllMigrations();

  for (const table of CLINICAL_TABLES) {
    it(`enables RLS on public.${table}`, () => {
      const re = new RegExp(
        `ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\b[^;]*ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
        "i",
      );
      const dynamicLoop = /FOREACH\s+t\s+IN\s+ARRAY[\s\S]*?ENABLE\s+ROW\s+LEVEL\s+SECURITY/i;
      expect(re.test(sql) || dynamicLoop.test(sql)).toBe(true);
    });

    it(`declares at least one policy on public.${table}`, () => {
      const re = new RegExp(`CREATE\\s+POLICY[^;]*ON\\s+(?:public\\.)?${table}\\b`, "i");
      expect(re.test(sql)).toBe(true);
    });
  }

  it("does not create the legacy /api/analyze-image route", () => {
    // Sanity: legacy public AI endpoint must remain absent.
    const files = readdirSync(join(process.cwd(), "src/routes"), { recursive: true }) as string[];
    const suspects = files.filter((f) => /analyze[-_]image/i.test(String(f)));
    expect(suspects).toEqual([]);
  });

  it("has no legacy route files without patient/assessment context", () => {
    const routes = readdirSync(join(process.cwd(), "src/routes"));
    const forbidden = [
      "_authenticated.avaliacao-postural.tsx",
      "_authenticated.avaliacao-dinamica.tsx",
      "_authenticated.exercicios.tsx",
    ];
    for (const name of forbidden) {
      expect(routes).not.toContain(name);
    }
  });
});