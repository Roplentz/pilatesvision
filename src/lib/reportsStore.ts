import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type ReportWithRelations = ReportRow & {
  patient: { name: string } | null;
};

export type ReportContent = {
  summary?: string;
  postural_findings?: string;
  dynamic_findings?: string;
  exercise_findings?: string;
  recommendations?: string;
  plan?: string;
  professional_notes?: string;
  disclaimer_acknowledged?: boolean;
};

export const REPORT_DISCLAIMER =
  "Este relatório é um documento de apoio à decisão clínica emitido pelo fisioterapeuta responsável. Não substitui diagnóstico médico ou julgamento profissional. As análises apoiadas por visão computacional têm caráter observacional.";

export type ReportFieldKey =
  | "title"
  | "summary"
  | "postural_findings"
  | "dynamic_findings"
  | "exercise_findings"
  | "recommendations"
  | "plan"
  | "professional_notes"
  | "disclaimer_acknowledged";

export type ReportValidationErrors = Partial<Record<ReportFieldKey, string>>;

export const REPORT_REQUIRED_FIELDS: ReadonlyArray<ReportFieldKey> = [
  "title",
  "summary",
  "postural_findings",
  "dynamic_findings",
  "exercise_findings",
  "recommendations",
  "plan",
  "professional_notes",
  "disclaimer_acknowledged",
];

const MIN_LEN: Partial<Record<ReportFieldKey, number>> = {
  title: 4,
  summary: 30,
  postural_findings: 15,
  dynamic_findings: 15,
  exercise_findings: 15,
  recommendations: 20,
  plan: 20,
  professional_notes: 15,
};

const LABEL: Record<ReportFieldKey, string> = {
  title: "Título do relatório",
  summary: "Resumo clínico",
  postural_findings: "Achados posturais",
  dynamic_findings: "Achados dinâmicos",
  exercise_findings: "Achados por exercício",
  recommendations: "Recomendações clínicas",
  plan: "Plano de acompanhamento",
  professional_notes: "Notas do profissional responsável",
  disclaimer_acknowledged: "Ciência do disclaimer clínico",
};

export function reportFieldLabel(key: ReportFieldKey): string {
  return LABEL[key];
}

/** Valida todos os campos obrigatórios antes de permitir finalizar. */
export function validateReportForFinalization(
  title: string,
  content: ReportContent,
): ReportValidationErrors {
  const errors: ReportValidationErrors = {};
  const check = (key: ReportFieldKey, value: string | undefined) => {
    const v = (value ?? "").trim();
    if (!v) {
      errors[key] = `${LABEL[key]} é obrigatório.`;
      return;
    }
    const min = MIN_LEN[key];
    if (min && v.length < min) {
      errors[key] = `${LABEL[key]} deve ter ao menos ${min} caracteres (atual: ${v.length}).`;
    }
  };
  check("title", title);
  check("summary", content.summary);
  check("postural_findings", content.postural_findings);
  check("dynamic_findings", content.dynamic_findings);
  check("exercise_findings", content.exercise_findings);
  check("recommendations", content.recommendations);
  check("plan", content.plan);
  check("professional_notes", content.professional_notes);
  if (!content.disclaimer_acknowledged) {
    errors.disclaimer_acknowledged = "Confirme a ciência do disclaimer clínico para finalizar.";
  }
  return errors;
}

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

export async function updateReport(
  id: string,
  patch: { title?: string; content?: ReportContent },
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
  content: ReportContent,
): Promise<ReportRow> {
  const errors = validateReportForFinalization(title, content);
  if (Object.keys(errors).length > 0) {
    throw new ReportValidationError(errors);
  }
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("reports")
    .update({
      title,
      content: content as unknown as Json,
      status: "completed",
      finalized_at: now,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ReportRow;
}

export class ReportValidationError extends Error {
  errors: ReportValidationErrors;
  constructor(errors: ReportValidationErrors) {
    super("Relatório com campos obrigatórios pendentes.");
    this.name = "ReportValidationError";
    this.errors = errors;
  }
}
