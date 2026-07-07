import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  ExerciseCompensation,
  MovementCompensation,
  PosturalFinding,
} from "@/lib/assessmentsStore";

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];

export const REPORT_DISCLAIMER =
  "Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável.";

export interface ReportClinicInfo {
  name: string;
  responsible?: string | null;
  city?: string | null;
  state?: string | null;
  logo_url?: string | null;
}
export interface ReportStudentInfo {
  name: string;
  age?: number | null;
  sex?: string | null;
}
export interface ReportAssessmentInfo {
  date: string;
  type: string;
  objective?: string | null;
  main_complaint?: string | null;
  pain_score?: number | null;
}
export interface ReportSummary {
  title: string;
  text: string;
}
export interface ReportPlan {
  frequency: string;
  focus: string;
  duration: string;
}
export interface ReportPosturalFinding {
  view: string;
  region: string;
  finding: string;
  severity: string;
  notes?: string;
}
export interface ReportMovementFinding {
  movement: string;
  compensation: string;
  severity: string;
  notes?: string;
}
export interface ReportExerciseFinding {
  exercise: string;
  apparatus?: string;
  compensation: string;
  severity: string;
  notes?: string;
}

export interface ReportContent {
  clinic: ReportClinicInfo;
  student: ReportStudentInfo;
  assessment: ReportAssessmentInfo;
  summary: ReportSummary;
  postural_findings: ReportPosturalFinding[];
  movement_findings: ReportMovementFinding[];
  exercise_findings: ReportExerciseFinding[];
  recommendations: string[];
  plan: ReportPlan;
  professional_notes: string;
  disclaimer: string;
}

export function emptyReportContent(): ReportContent {
  return {
    clinic: { name: "" },
    student: { name: "" },
    assessment: { date: "", type: "" },
    summary: { title: "Resumo clínico", text: "" },
    postural_findings: [],
    movement_findings: [],
    exercise_findings: [],
    recommendations: [],
    plan: { frequency: "", focus: "", duration: "" },
    professional_notes: "",
    disclaimer: REPORT_DISCLAIMER,
  };
}

const typeLabel: Record<string, string> = {
  postural: "Postural",
  dynamic: "Dinâmica",
  exercise: "Por exercício",
  complete: "Completa",
  general: "Geral",
};

/**
 * Monta o `content` inicial do relatório a partir dos dados já existentes
 * (avaliação, paciente, clínica, achados). Nenhuma IA envolvida.
 */
export async function buildReportContentFromAssessment(
  assessmentId: string,
): Promise<{ content: ReportContent; clinicId: string; studentId: string; title: string }> {
  const [asmtRes, posturalRes, movementRes, exerciseRes] = await Promise.all([
    supabase
      .from("assessments")
      .select("*, students(name, age, gender), clinics(name, address, logo_url)")
      .eq("id", assessmentId)
      .maybeSingle(),
    supabase.from("postural_results").select("*").eq("assessment_id", assessmentId),
    supabase.from("movement_results").select("*").eq("assessment_id", assessmentId),
    supabase.from("exercise_results").select("*").eq("assessment_id", assessmentId),
  ]);
  if (asmtRes.error) throw new Error(asmtRes.error.message);
  const asmt = asmtRes.data as unknown as
    | (Database["public"]["Tables"]["assessments"]["Row"] & {
        students: { name: string; age: number | null; gender: string | null } | null;
        clinics: {
          name: string;
          address: { city?: string; state?: string } | null;
          logo_url: string | null;
        } | null;
      })
    | null;
  if (!asmt) throw new Error("Avaliação não encontrada.");

  const postural: ReportPosturalFinding[] = [];
  for (const p of posturalRes.data ?? []) {
    const view = (p as { view: string | null }).view ?? "—";
    const items = Array.isArray((p as { findings: unknown }).findings)
      ? ((p as { findings: unknown }).findings as PosturalFinding[])
      : [];
    for (const f of items) {
      postural.push({
        view,
        region: f.region ?? "",
        finding: f.finding ?? "",
        severity: f.severity ?? "leve",
        notes: f.notes,
      });
    }
  }

  const movement: ReportMovementFinding[] = [];
  for (const m of movementRes.data ?? []) {
    const mv = (m as { movement_name: string | null }).movement_name ?? "—";
    const comps = Array.isArray((m as { compensations: unknown }).compensations)
      ? ((m as { compensations: unknown }).compensations as MovementCompensation[])
      : [];
    for (const c of comps) {
      movement.push({
        movement: c.movement ?? mv,
        compensation: c.compensation ?? "",
        severity: c.severity ?? "leve",
        notes: c.notes,
      });
    }
  }

  const exercise: ReportExerciseFinding[] = [];
  for (const e of exerciseRes.data ?? []) {
    const name = (e as { exercise_name: string }).exercise_name ?? "—";
    const app = (e as { apparatus: string | null }).apparatus ?? undefined;
    const comps = Array.isArray((e as { compensations: unknown }).compensations)
      ? ((e as { compensations: unknown }).compensations as ExerciseCompensation[])
      : [];
    if (comps.length === 0) {
      exercise.push({ exercise: name, apparatus: app, compensation: "—", severity: "leve" });
    } else {
      for (const c of comps) {
        exercise.push({
          exercise: name,
          apparatus: app,
          compensation: c.compensation ?? "",
          severity: c.severity ?? "leve",
          notes: c.notes,
        });
      }
    }
  }

  const address = (asmt.clinics?.address ?? null) as { city?: string; state?: string } | null;
  const title =
    (asmt.title && asmt.title.trim()) ||
    `Relatório evolutivo — ${asmt.students?.name ?? "Paciente"}`;

  const content: ReportContent = {
    clinic: {
      name: asmt.clinics?.name ?? "",
      responsible: null,
      city: address?.city ?? null,
      state: address?.state ?? null,
      logo_url: asmt.clinics?.logo_url ?? null,
    },
    student: {
      name: asmt.students?.name ?? "",
      age: asmt.students?.age ?? null,
      sex: asmt.students?.gender ?? null,
    },
    assessment: {
      date: (asmt.finalized_at ?? asmt.created_at) as string,
      type: typeLabel[asmt.type] ?? asmt.type,
      objective: asmt.objective,
      main_complaint: asmt.main_complaint,
      pain_score: asmt.pain_score ?? asmt.pain_level ?? null,
    },
    summary: {
      title: "Resumo clínico",
      text:
        asmt.clinical_notes?.trim() ||
        asmt.observations?.trim() ||
        "Resumo clínico a ser preenchido pelo profissional responsável.",
    },
    postural_findings: postural,
    movement_findings: movement,
    exercise_findings: exercise,
    recommendations: [],
    plan: { frequency: "", focus: "", duration: "" },
    professional_notes: "",
    disclaimer: REPORT_DISCLAIMER,
  };

  return {
    content,
    clinicId: asmt.clinic_id,
    studentId: asmt.student_id,
    title,
  };
}

/** Cria (ou retorna o existente) relatório em rascunho para a avaliação. */
export async function createReportFromAssessment(assessmentId: string): Promise<ReportRow> {
  // já existe?
  const existing = await supabase
    .from("reports")
    .select("*")
    .eq("assessment_id", assessmentId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data as ReportRow;

  const { content, clinicId, studentId, title } =
    await buildReportContentFromAssessment(assessmentId);

  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id ?? null;

  const { data, error } = await supabase
    .from("reports")
    .insert({
      assessment_id: assessmentId,
      clinic_id: clinicId,
      student_id: studentId,
      title,
      content: content as unknown as never,
      plain_text: buildPlainText(content),
      status: "draft",
      version: 1,
      created_by: uid,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}

export async function updateReport(id: string, patch: ReportUpdate): Promise<ReportRow> {
  const { data, error } = await supabase
    .from("reports")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}

export async function finalizeReport(id: string, content: ReportContent, title: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("reports")
    .update({
      title,
      content: content as unknown as never,
      plain_text: buildPlainText(content),
      status: "finalized",
      finalized_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}

function buildPlainText(c: ReportContent): string {
  const lines: string[] = [];
  lines.push(c.summary.title);
  lines.push(c.summary.text);
  if (c.postural_findings.length) {
    lines.push("Achados posturais:");
    for (const f of c.postural_findings)
      lines.push(`- [${f.severity}] ${f.view} · ${f.region}: ${f.finding}`);
  }
  if (c.movement_findings.length) {
    lines.push("Achados dinâmicos:");
    for (const f of c.movement_findings)
      lines.push(`- [${f.severity}] ${f.movement}: ${f.compensation}`);
  }
  if (c.exercise_findings.length) {
    lines.push("Achados por exercício:");
    for (const f of c.exercise_findings)
      lines.push(`- [${f.severity}] ${f.exercise}${f.apparatus ? ` (${f.apparatus})` : ""}: ${f.compensation}`);
  }
  if (c.recommendations.length) {
    lines.push("Recomendações:");
    for (const r of c.recommendations) lines.push(`- ${r}`);
  }
  lines.push(c.disclaimer);
  return lines.join("\n");
}

export function useReport(id: string | null | undefined) {
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setReport(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setReport((data as ReportRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { report, loading, error, reload };
}

export function useStudentReports(studentId: string | null | undefined) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(studentId));

  useEffect(() => {
    if (!studentId) {
      setReports([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("reports")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setReports((data ?? []) as ReportRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { reports, loading };
}

export function toReportContent(raw: unknown): ReportContent {
  const base = emptyReportContent();
  if (!raw || typeof raw !== "object") return base;
  const merged = { ...base, ...(raw as Partial<ReportContent>) };
  return {
    ...merged,
    clinic: { ...base.clinic, ...(merged.clinic ?? {}) },
    student: { ...base.student, ...(merged.student ?? {}) },
    assessment: { ...base.assessment, ...(merged.assessment ?? {}) },
    summary: { ...base.summary, ...(merged.summary ?? {}) },
    plan: { ...base.plan, ...(merged.plan ?? {}) },
    postural_findings: merged.postural_findings ?? [],
    movement_findings: merged.movement_findings ?? [],
    exercise_findings: merged.exercise_findings ?? [],
    recommendations: merged.recommendations ?? [],
    professional_notes: merged.professional_notes ?? "",
    disclaimer: REPORT_DISCLAIMER,
  };
}