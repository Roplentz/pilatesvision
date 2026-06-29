import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentWithStudent = AssessmentRow & {
  students: { name: string } | null;
};
export type NewAssessmentInput = Omit<
  Database["public"]["Tables"]["assessments"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

/** Lista avaliações de uma clínica, incluindo o nome do aluno relacionado. */
export function useAssessments(clinicId: string | null | undefined) {
  const [assessments, setAssessments] = useState<AssessmentWithStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clinicId) {
      setAssessments([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("assessments")
      .select("*, students(name)")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setAssessments((data ?? []) as unknown as AssessmentWithStudent[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { assessments, loading, error };
}

/** Insere uma nova avaliação. clinic_id deve vir do perfil do usuário logado. */
export async function createAssessment(
  input: NewAssessmentInput,
): Promise<AssessmentRow> {
  const { data, error } = await supabase
    .from("assessments")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as AssessmentRow;
}
