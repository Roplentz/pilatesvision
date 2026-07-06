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

export type PosturalResultRow = Database["public"]["Tables"]["postural_results"]["Row"];
export type MovementResultRow = Database["public"]["Tables"]["movement_results"]["Row"];
export type PrescribedExerciseRow = Database["public"]["Tables"]["prescribed_exercises"]["Row"];
export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

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
export async function createAssessment(input: NewAssessmentInput): Promise<AssessmentRow> {
  const { data, error } = await supabase.from("assessments").insert(input).select("*").single();
  if (error) throw new Error(error.message);
  return data as AssessmentRow;
}

/** Busca uma avaliação pelo id, com o nome do aluno. */
export function useAssessment(id: string | null | undefined) {
  const [assessment, setAssessment] = useState<AssessmentWithStudent | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setAssessment(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("assessments")
      .select("*, students(name)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setAssessment((data as unknown as AssessmentWithStudent | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { assessment, loading, error };
}

/** Carrega resultados relacionados (postural, dinâmica, exercícios, relatório). */
export function useAssessmentExtras(assessmentId: string | null | undefined) {
  const [postural, setPostural] = useState<PosturalResultRow | null>(null);
  const [movement, setMovement] = useState<MovementResultRow | null>(null);
  const [prescribed, setPrescribed] = useState<PrescribedExerciseRow[]>([]);
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(assessmentId));

  useEffect(() => {
    if (!assessmentId) {
      setPostural(null);
      setMovement(null);
      setPrescribed([]);
      setReport(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("postural_results").select("*").eq("assessment_id", assessmentId).maybeSingle(),
      supabase.from("movement_results").select("*").eq("assessment_id", assessmentId).maybeSingle(),
      supabase
        .from("prescribed_exercises")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("order_index", { ascending: true }),
      supabase.from("reports").select("*").eq("assessment_id", assessmentId).maybeSingle(),
    ]).then(([p, m, pres, r]) => {
      if (cancelled) return;
      setPostural((p.data as PosturalResultRow | null) ?? null);
      setMovement((m.data as MovementResultRow | null) ?? null);
      setPrescribed((pres.data ?? []) as PrescribedExerciseRow[]);
      setReport((r.data as ReportRow | null) ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  return { postural, movement, prescribed, report, loading };
}

/** Lista avaliações de um aluno específico. */
export function useStudentAssessments(studentId: string | null | undefined) {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(studentId));

  useEffect(() => {
    if (!studentId) {
      setAssessments([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("assessments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setAssessments((data ?? []) as AssessmentRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { assessments, loading };
}
