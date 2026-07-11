import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ExerciseLibraryRow = Database["public"]["Tables"]["exercise_library"]["Row"];

export type ExerciseLibraryFilters = {
  query?: string;
  equipment?: string | null;
  level?: string | null;
  primaryGoal?: string | null;
};

/** Lista o catálogo global de exercícios (RLS: leitura para autenticado). */
export function useExerciseLibrary(filters: ExerciseLibraryFilters = {}) {
  const [rows, setRows] = useState<ExerciseLibraryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("exercise_library")
      .select("*")
      .eq("is_active", true)
      .order("equipment", { ascending: true })
      .order("name_pt", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setRows((data ?? []) as ExerciseLibraryRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = (filters.query ?? "").trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.equipment && filters.equipment !== "all" && r.equipment !== filters.equipment)
        return false;
      if (filters.level && filters.level !== "all" && r.level !== filters.level) return false;
      if (
        filters.primaryGoal &&
        filters.primaryGoal !== "all" &&
        (r.primary_goal ?? "") !== filters.primaryGoal
      )
        return false;
      if (q) {
        const hay = [r.name_pt, r.name_en ?? "", r.equipment, r.primary_goal ?? "", r.method_family ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters.query, filters.equipment, filters.level, filters.primaryGoal]);

  const options = useMemo(() => {
    const equipments = Array.from(new Set(rows.map((r) => r.equipment))).sort();
    const levels = Array.from(new Set(rows.map((r) => r.level))).sort();
    const goals = Array.from(
      new Set(rows.map((r) => r.primary_goal ?? "").filter(Boolean)),
    ).sort();
    return { equipments, levels, goals };
  }, [rows]);

  return { rows: filtered, all: rows, options, loading, error };
}

export const LEVEL_LABEL_LIB: Record<string, string> = {
  iniciante: "Iniciante",
  "iniciante-intermediario": "Iniciante/Intermediário",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const SUPPORT_LEVEL_OPTIONS: Array<{
  value: 0 | 1 | 2 | 3;
  label: string;
  hint: string;
  tone: string;
}> = [
  {
    value: 0,
    label: "0 · Observação segura",
    hint: "Execução sem alerta relevante",
    tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    value: 1,
    label: "1 · Atenção técnica",
    hint: "Ajuste técnico sugerido",
    tone: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  {
    value: 2,
    label: "2 · Regressão recomendada",
    hint: "Sugerida regressão / redução de carga",
    tone: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    value: 3,
    label: "3 · Interromper e reavaliar",
    hint: "Recomendada reavaliação antes de progredir",
    tone: "bg-red-500/15 text-red-300 border-red-500/30",
  },
];