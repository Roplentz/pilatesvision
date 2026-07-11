import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type ReportWithRelations = ReportRow & {
  patient: { name: string } | null;
};

/* =========================================================================
 *  Report JSON (12-section premium report shape)
 *  Stored in `reports.content` (jsonb).
 * =======================================================================*/

export type Severity = "low" | "moderate" | "high";

export type PosturalFindingJson = {
  body_region: string;
  description: string;
  severity: Severity;
  image_url?: string;
};

export type DynamicFindingJson = {
  movement: string;
  compensations: string[];
  quality_score: number; // 0-100
  notes?: string;
};

export type ExerciseFindingJson = {
  exercise: string;
  /** 0 sem alerta · 1 ajuste técnico · 2 regressão/redução · 3 reavaliação */
  support_level: 0 | 1 | 2 | 3;
  observations: string[];
  suggested_cues?: string[];
};

export type InitialPlanItemJson = {
  exercise: string;
  sets: number;
  reps: number;
  notes?: string;
};

export type ReportJson = {
  version: "1.0";
  clinic: {
    name: string;
    logo_url: string;
    professional: string;
    professional_license: string;
  };
  patient: {
    full_name: string;
    age: number;
    sex: string;
    occupation?: string;
    main_goal: string;
  };
  assessment: {
    date: string;
    type: string;
    status: string;
  };
  objective: string;
  clinical_summary: string;
  postural_findings: PosturalFindingJson[];
  dynamic_findings: DynamicFindingJson[];
  exercise_findings: ExerciseFindingJson[];
  recommendations: string[];
  initial_plan: InitialPlanItemJson[];
  professional_notes: string;
  disclaimer: string;
};

export const REPORT_DISCLAIMER =
  "Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável. Os indicadores apresentados derivam de análise observacional e devem ser interpretados pelo profissional habilitado.";

export const SUPPORT_LEVEL_LABEL: Record<0 | 1 | 2 | 3, string> = {
  0: "Execução sem alerta relevante",
  1: "Ajuste técnico sugerido",
  2: "Sugerida regressão / redução de carga",
  3: "Recomendada reavaliação antes de progredir",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Leve",
  moderate: "Moderada",
  high: "Importante",
};

export const ASSESSMENT_TYPE_LABEL: Record<string, string> = {
  postural_static: "Avaliação postural",
  dynamic: "Avaliação dinâmica",
  pilates_exercise: "Avaliação por exercício",
  follow_up: "Acompanhamento evolutivo",
};

/* =========================================================================
 *  Empty / default builders
 * =======================================================================*/

export function emptyReportJson(): ReportJson {
  return {
    version: "1.0",
    clinic: { name: "", logo_url: "", professional: "", professional_license: "" },
    patient: { full_name: "", age: 0, sex: "", occupation: "", main_goal: "" },
    assessment: { date: "", type: "postural_static", status: "draft" },
    objective: "",
    clinical_summary: "",
    postural_findings: [],
    dynamic_findings: [],
    exercise_findings: [],
    recommendations: [],
    initial_plan: [],
    professional_notes: "",
    disclaimer: REPORT_DISCLAIMER,
  };
}

/** Normaliza qualquer json existente para o shape completo. */
export function normalizeReportJson(raw: unknown): ReportJson {
  const base = emptyReportJson();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<ReportJson>;
  return {
    ...base,
    ...r,
    clinic: { ...base.clinic, ...(r.clinic ?? {}) },
    patient: { ...base.patient, ...(r.patient ?? {}) },
    assessment: { ...base.assessment, ...(r.assessment ?? {}) },
    postural_findings: Array.isArray(r.postural_findings) ? r.postural_findings : [],
    dynamic_findings: Array.isArray(r.dynamic_findings) ? r.dynamic_findings : [],
    exercise_findings: Array.isArray(r.exercise_findings) ? r.exercise_findings : [],
    recommendations: Array.isArray(r.recommendations) ? r.recommendations : [],
    initial_plan: Array.isArray(r.initial_plan) ? r.initial_plan : [],
    disclaimer: REPORT_DISCLAIMER, // sempre fixo
  };
}

/* =========================================================================
 *  Hooks
 * =======================================================================*/

export function useReport(id: string | null | undefined) {
  const [report, setReport] = useState<ReportWithRelations | null>(null);
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
      .select("*, patient:patients(name)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setReport((data as unknown as ReportWithRelations | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return { report, loading, error, reload: () => setReloadKey((k) => k + 1) };
}

/** Lista todos os relatórios (draft + finalizados) de um paciente. */
export function usePatientReports(patientId: string | null | undefined) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(patientId));

  useEffect(() => {
    if (!patientId) {
      setReports([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("reports")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setReports((data ?? []) as ReportRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return { reports, loading };
}

/* =========================================================================
 *  Mutations
 * =======================================================================*/

export async function updateReport(
  id: string,
  patch: { title?: string; content?: ReportJson },
): Promise<ReportRow> {
  const update: Database["public"]["Tables"]["reports"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.content !== undefined) update.content = patch.content as unknown as Json;
  const { data, error } = await supabase
    .from("reports")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}

export async function finalizeReport(
  id: string,
  title: string,
  content: ReportJson,
): Promise<ReportRow> {
  const now = new Date().toISOString();
  const finalContent: ReportJson = {
    ...content,
    disclaimer: REPORT_DISCLAIMER,
    assessment: { ...content.assessment, status: "final" },
  };
  const { data, error } = await supabase
    .from("reports")
    .update({
      title,
      content: finalContent as unknown as Json,
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

/* =========================================================================
 *  Report generation from a completed assessment
 *  Reads assessment + patient + clinic + professional + all result tables
 *  and assembles a draft ReportJson, persisting it into `reports`.
 * =======================================================================*/

type LegacyPosturalFinding = {
  region?: string;
  finding?: string;
  severity?: string;
  notes?: string;
};
type LegacyMovementCompensation = {
  movement?: string;
  compensation?: string;
  severity?: string;
  notes?: string;
};
type LegacyExerciseCompensation = {
  compensation?: string;
  severity?: string;
  notes?: string;
};

function mapSeverity(raw: unknown): Severity {
  const s = String(raw ?? "").toLowerCase();
  if (s === "importante" || s === "high" || s === "severe") return "high";
  if (s === "leve" || s === "low" || s === "mild") return "low";
  return "moderate";
}

function computeAge(birthDate: string | null, fallback: number | null): number {
  if (birthDate) {
    const b = new Date(birthDate);
    if (!Number.isNaN(b.getTime())) {
      const now = new Date();
      let age = now.getFullYear() - b.getFullYear();
      const m = now.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
      return age;
    }
  }
  return fallback ?? 0;
}

function movementQualityScore(m: {
  controle: number | null;
  estabilidade: number | null;
  simetria: number | null;
  amplitude: number | null;
}): number {
  const vals = [m.controle, m.estabilidade, m.simetria, m.amplitude].filter(
    (v): v is number => typeof v === "number",
  );
  if (vals.length === 0) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  // valores parecem já estar em 0–100; se estiverem em 0–10, escalar.
  const scaled = avg > 10 ? avg : avg * 10;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

function controlToSupportLevel(control: string | null): 0 | 1 | 2 | 3 {
  const c = (control ?? "").toLowerCase();
  if (c === "excelente" || c === "bom") return 0;
  if (c === "moderado") return 1;
  if (c === "baixo") return 2;
  return 1;
}

function parseSeries(series: string | null): { sets: number; reps: number; notes: string } {
  const raw = (series ?? "").trim();
  if (!raw) return { sets: 0, reps: 0, notes: "" };
  const m = raw.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (m) return { sets: Number(m[1]), reps: Number(m[2]), notes: "" };
  return { sets: 0, reps: 0, notes: raw };
}

/** Cria (ou reaproveita) um relatório rascunho a partir de uma avaliação. */
export async function generateReportFromAssessment(assessmentId: string): Promise<ReportRow> {
  // Reaproveita relatório existente (evita duplicidade por avaliação)
  const existing = await supabase
    .from("reports")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing.data) return existing.data as ReportRow;

  const assessmentQ = await supabase
    .from("assessments")
    .select("*, patient:patients(*), clinic:clinics(*)")
    .eq("id", assessmentId)
    .maybeSingle();
  if (assessmentQ.error) throw new Error(assessmentQ.error.message);
  const assessment = assessmentQ.data as
    | (Database["public"]["Tables"]["assessments"]["Row"] & {
        patient: Database["public"]["Tables"]["patients"]["Row"] | null;
        clinic: Database["public"]["Tables"]["clinics"]["Row"] | null;
      })
    | null;
  if (!assessment) throw new Error("Avaliação não encontrada.");
  if (!assessment.patient) throw new Error("Paciente vinculado não encontrado.");
  if (!assessment.clinic) throw new Error("Clínica vinculada não encontrada.");

  const professionalId = assessment.professional_id;
  let professionalName = "";
  if (professionalId) {
    const p = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", professionalId)
      .maybeSingle();
    professionalName = (p.data?.full_name as string | undefined) ?? "";
  }

  const [posturalQ, movementQ, exerciseQ, prescribedQ] = await Promise.all([
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
    supabase
      .from("prescribed_exercises")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("order_index", { ascending: true }),
  ]);

  const posturalFindings: PosturalFindingJson[] = [];
  for (const row of posturalQ.data ?? []) {
    const findings = Array.isArray(row.findings) ? (row.findings as LegacyPosturalFinding[]) : [];
    if (findings.length === 0 && row.view) {
      posturalFindings.push({
        body_region: `Vista ${row.view}`,
        description: row.professional_notes ?? "Registro de imagem sem achados descritos.",
        severity: "moderate",
        image_url: row.image_url ?? undefined,
      });
    }
    for (const f of findings) {
      posturalFindings.push({
        body_region: (f.region ?? row.view ?? "").toString(),
        description: [f.finding, f.notes].filter(Boolean).join(" — "),
        severity: mapSeverity(f.severity),
        image_url: row.image_url ?? undefined,
      });
    }
  }

  const dynamicFindings: DynamicFindingJson[] = (movementQ.data ?? []).map((row) => {
    const comps = Array.isArray(row.compensations)
      ? (row.compensations as LegacyMovementCompensation[])
      : [];
    return {
      movement: row.movement_name ?? "Movimento avaliado",
      compensations: comps.map((c) => c.compensation ?? "").filter(Boolean),
      quality_score: movementQualityScore(row),
      notes: row.professional_notes ?? undefined,
    };
  });

  const exerciseFindings: ExerciseFindingJson[] = (exerciseQ.data ?? []).map((row) => {
    const comps = Array.isArray(row.compensations)
      ? (row.compensations as LegacyExerciseCompensation[])
      : [];
    const obs = [
      row.execution_notes ?? "",
      ...comps.map((c) => c.compensation ?? "").filter(Boolean),
    ].filter((s) => s.trim().length > 0);
    return {
      exercise: [row.exercise_name, row.apparatus].filter(Boolean).join(" · "),
      support_level: controlToSupportLevel(row.control_level),
      observations: obs,
      suggested_cues: row.recommendation ? [row.recommendation] : [],
    };
  });

  const initialPlan: InitialPlanItemJson[] = (prescribedQ.data ?? []).map((row) => {
    const { sets, reps, notes } = parseSeries(row.series ?? null);
    return {
      exercise: row.name ?? "Exercício",
      sets,
      reps,
      notes: [row.focus ?? "", row.level ?? "", notes].filter(Boolean).join(" · ") || undefined,
    };
  });

  // Recomendações iniciais: agrega recomendações únicas dos exercícios avaliados.
  const recommendations: string[] = Array.from(
    new Set(
      (exerciseQ.data ?? [])
        .map((r) => (r.recommendation ?? "").trim())
        .filter((s) => s.length > 0),
    ),
  );

  const mainGoal =
    (Array.isArray(assessment.patient.goals) && assessment.patient.goals[0]) || "";
  const complaint =
    assessment.main_complaint || assessment.patient.main_complaint || "";

  const clinicalSummaryBase = [
    mainGoal ? `Paciente com objetivo de ${mainGoal}.` : "",
    complaint ? `Relata ${complaint}.` : "",
    "Na avaliação, observaram-se os achados abaixo, que servem de apoio ao raciocínio clínico e ao acompanhamento evolutivo.",
  ]
    .filter(Boolean)
    .join(" ");

  const json: ReportJson = {
    version: "1.0",
    clinic: {
      name: assessment.clinic.name,
      logo_url: assessment.clinic.logo_url ?? "",
      professional: professionalName,
      professional_license: "",
    },
    patient: {
      full_name: assessment.patient.name,
      age: computeAge(assessment.patient.birth_date ?? null, assessment.patient.age ?? null),
      sex: assessment.patient.gender ?? "",
      occupation: "",
      main_goal: mainGoal,
    },
    assessment: {
      date: assessment.finalized_at ?? assessment.created_at,
      type: assessment.type,
      status: assessment.status === "completed" ? "final" : "draft",
    },
    objective: assessment.objective ?? "",
    clinical_summary: clinicalSummaryBase,
    postural_findings: posturalFindings,
    dynamic_findings: dynamicFindings,
    exercise_findings: exerciseFindings,
    recommendations,
    initial_plan: initialPlan,
    professional_notes: assessment.clinical_notes ?? "",
    disclaimer: REPORT_DISCLAIMER,
  };

  const title =
    `${ASSESSMENT_TYPE_LABEL[assessment.type] ?? "Relatório clínico"} — ${assessment.patient.name}`;

  const { data, error } = await supabase
    .from("reports")
    .insert({
      assessment_id: assessment.id,
      clinic_id: assessment.clinic_id,
      patient_id: assessment.patient_id,
      title,
      status: "draft",
      content: json as unknown as Json,
      created_by: professionalId,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}
