import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AssessmentRow = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentWithPatient = AssessmentRow & {
  patient: { name: string } | null;
};
export type NewAssessmentInput = Omit<
  Database["public"]["Tables"]["assessments"]["Insert"],
  "id" | "created_at" | "updated_at"
>;
export type UpdateAssessmentInput = Database["public"]["Tables"]["assessments"]["Update"];

export type PosturalResultRow = Database["public"]["Tables"]["postural_results"]["Row"];
export type MovementResultRow = Database["public"]["Tables"]["movement_results"]["Row"];
export type ExerciseResultRow = Database["public"]["Tables"]["exercise_results"]["Row"];
export type PrescribedExerciseRow = Database["public"]["Tables"]["prescribed_exercises"]["Row"];
export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export type AssessmentType =
  | "postural_static"
  | "dynamic"
  | "pilates_exercise"
  | "follow_up";
export type AssessmentStatus =
  | "draft"
  | "processing"
  | "review"
  | "completed"
  | "archived";

export type PosturalView = "anterior" | "posterior" | "right_lateral" | "left_lateral";
export type Severity = "leve" | "moderada" | "importante";
export type ControlLevel = "baixo" | "moderado" | "bom" | "excelente";

export type PosturalFinding = {
  region: string;
  finding: string;
  severity: Severity;
  notes?: string;
};
export type MovementCompensation = {
  movement?: string;
  compensation: string;
  severity: Severity;
  notes?: string;
};
export type ExerciseCompensation = {
  compensation: string;
  severity: Severity;
  notes?: string;
};

/** Lista avaliações de uma clínica, incluindo o nome do aluno relacionado. */
export function useAssessments(clinicId: string | null | undefined) {
  const [assessments, setAssessments] = useState<AssessmentWithPatient[]>([]);
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
      .select("*, patient:patients(name)")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setAssessments((data ?? []) as unknown as AssessmentWithPatient[]);
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

/** Atualiza uma avaliação (usada enquanto rascunho). */
export async function updateAssessment(
  id: string,
  patch: UpdateAssessmentInput,
): Promise<AssessmentRow> {
  const { data, error } = await supabase
    .from("assessments")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as AssessmentRow;
}

/** Finaliza avaliação: status='completed' e finalized_at=now(). */
export async function finalizeAssessment(id: string): Promise<AssessmentRow> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("assessments")
    .update({ status: "completed", finalized_at: now, updated_at: now })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as AssessmentRow;
}

/** Insere um achado postural (uma vista por registro). */
export async function insertPosturalResult(
  input: Database["public"]["Tables"]["postural_results"]["Insert"],
): Promise<PosturalResultRow> {
  const { data, error } = await supabase
    .from("postural_results")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PosturalResultRow;
}

/** Insere um resultado dinâmico. */
export async function insertMovementResult(
  input: Database["public"]["Tables"]["movement_results"]["Insert"],
): Promise<MovementResultRow> {
  const { data, error } = await supabase
    .from("movement_results")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as MovementResultRow;
}

/** Insere um resultado por exercício. */
export async function insertExerciseResult(
  input: Database["public"]["Tables"]["exercise_results"]["Insert"],
): Promise<ExerciseResultRow> {
  const { data, error } = await supabase
    .from("exercise_results")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ExerciseResultRow;
}

/** Lista todos os resultados posturais/dinâmicos/exercício vinculados à avaliação. */
export function useAssessmentResults(assessmentId: string | null | undefined) {
  const [postural, setPostural] = useState<PosturalResultRow[]>([]);
  const [movement, setMovement] = useState<MovementResultRow[]>([]);
  const [exercise, setExercise] = useState<ExerciseResultRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(assessmentId));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!assessmentId) {
      setPostural([]);
      setMovement([]);
      setExercise([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase
        .from("postural_results")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true }),
      supabase
        .from("movement_results")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true }),
      supabase
        .from("exercise_results")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true }),
    ]).then(([p, m, e]) => {
      if (cancelled) return;
      setPostural((p.data ?? []) as PosturalResultRow[]);
      setMovement((m.data ?? []) as MovementResultRow[]);
      setExercise((e.data ?? []) as ExerciseResultRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [assessmentId, reloadKey]);

  return {
    postural,
    movement,
    exercise,
    loading,
    reload: () => setReloadKey((k) => k + 1),
  };
}

/** Busca uma avaliação pelo id, com o nome do aluno. */
export function useAssessment(id: string | null | undefined) {
  const [assessment, setAssessment] = useState<AssessmentWithPatient | null>(null);
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
      .select("*, patient:patients(name)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setAssessment((data as unknown as AssessmentWithPatient | null) ?? null);
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
export function usePatientAssessments(patientId: string | null | undefined) {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(patientId));

  useEffect(() => {
    if (!patientId) {
      setAssessments([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("assessments")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setAssessments((data ?? []) as AssessmentRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return { assessments, loading };
}
