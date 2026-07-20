import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Shadow engine comparison (plataforma)
// ---------------------------------------------------------------------------

export interface ShadowSampleDivergence {
  assessmentId: string;
  clinicId: string;
  createdAt: string;
  legacyReps: number | null;
  shadowReps: number | null;
  shadowValidReps: number | null;
  diffTotal: number | null;
  diffValid: number | null;
  shadowStatus: string | null;
}

export interface ShadowComparisonSummary {
  totalMovementResults: number;
  withShadow: number;
  withComparison: number;
  meanAbsDiffTotal: number | null;
  meanAbsDiffValid: number | null;
  agreementRate: number | null;
  errors: number;
  samples: ShadowSampleDivergence[];
}

type ShadowPayload = {
  status?: string;
  repetitionsDetected?: number;
  repetitionsValid?: number;
  comparison?: {
    legacyRepetitionsTotal?: number | null;
    diffTotal?: number | null;
    diffValid?: number | null;
  };
};

function readShadow(metrics: unknown): ShadowPayload | null {
  if (!metrics || typeof metrics !== "object") return null;
  const raw = (metrics as Record<string, unknown>).fisiohub_motion_core_shadow;
  if (!raw || typeof raw !== "object") return null;
  return raw as ShadowPayload;
}

export const getShadowEngineComparison = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ShadowComparisonSummary> => {
    const { data: isAdmin } = await context.supabase.rpc("is_platform_admin");
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("movement_results")
      .select("assessment_id, clinic_id, created_at, metrics")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const samples: ShadowSampleDivergence[] = [];
    let withShadow = 0;
    let withComparison = 0;
    let errors = 0;
    let sumAbsTotal = 0;
    let countTotal = 0;
    let sumAbsValid = 0;
    let countValid = 0;
    let agree = 0;

    for (const row of data ?? []) {
      const shadow = readShadow(row.metrics);
      if (!shadow) continue;
      withShadow++;
      if (shadow.status === "error") errors++;

      const legacy = shadow.comparison?.legacyRepetitionsTotal ?? null;
      const shadowReps = shadow.repetitionsDetected ?? null;
      const shadowValid = shadow.repetitionsValid ?? null;
      const diffTotal = shadow.comparison?.diffTotal ?? null;
      const diffValid = shadow.comparison?.diffValid ?? null;

      if (typeof diffTotal === "number") {
        sumAbsTotal += Math.abs(diffTotal);
        countTotal++;
        if (diffTotal === 0) agree++;
        withComparison++;
      }
      if (typeof diffValid === "number") {
        sumAbsValid += Math.abs(diffValid);
        countValid++;
      }

      if (samples.length < 25) {
        samples.push({
          assessmentId: row.assessment_id,
          clinicId: row.clinic_id,
          createdAt: row.created_at,
          legacyReps: legacy,
          shadowReps,
          shadowValidReps: shadowValid,
          diffTotal,
          diffValid,
          shadowStatus: shadow.status ?? null,
        });
      }
    }

    return {
      totalMovementResults: data?.length ?? 0,
      withShadow,
      withComparison,
      meanAbsDiffTotal: countTotal > 0 ? sumAbsTotal / countTotal : null,
      meanAbsDiffValid: countValid > 0 ? sumAbsValid / countValid : null,
      agreementRate: countTotal > 0 ? agree / countTotal : null,
      errors,
      samples,
    };
  });

// ---------------------------------------------------------------------------
// Export LGPD por paciente
// ---------------------------------------------------------------------------

export interface PatientDataExport {
  generatedAt: string;
  clinic: Record<string, unknown> | null;
  patient: Record<string, unknown>;
  consents: Array<Record<string, unknown>>;
  assessments: Array<Record<string, unknown>>;
  posturalResults: Array<Record<string, unknown>>;
  movementResults: Array<Record<string, unknown>>;
  exerciseResults: Array<Record<string, unknown>>;
  poseCaptures: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
  fisiovisionAnalyses: Array<Record<string, unknown>>;
}

export const exportPatientData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { patientId: string }) => {
    if (!data?.patientId || typeof data.patientId !== "string") {
      throw new Error("patientId obrigatório");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<PatientDataExport> => {
    const { supabase, userId } = context;

    // Autorização: profissional da mesma clínica com role owner/admin
    // ou administrador da plataforma.
    const [{ data: profile }, { data: isPlatformAdmin }] = await Promise.all([
      supabase.from("profiles").select("clinic_id, role").eq("id", userId).maybeSingle(),
      supabase.rpc("is_platform_admin"),
    ]);

    const { data: patient, error: patientErr } = await supabase
      .from("patients")
      .select("*")
      .eq("id", data.patientId)
      .maybeSingle();
    if (patientErr) throw new Error(patientErr.message);
    if (!patient) throw new Error("Paciente não encontrado");

    const allowed =
      Boolean(isPlatformAdmin) ||
      (profile?.clinic_id === patient.clinic_id &&
        (profile?.role === "owner" || profile?.role === "admin"));
    if (!allowed) throw new Error("Forbidden");

    const q = (table: string) =>
      supabase.from(table as never).select("*").eq("patient_id", data.patientId);

    const [
      clinic,
      consents,
      assessments,
      postural,
      movement,
      exercise,
      poseCaps,
      reports,
      fisio,
    ] = await Promise.all([
      supabase.from("clinics").select("*").eq("id", patient.clinic_id).maybeSingle(),
      q("patient_consents"),
      q("assessments"),
      q("postural_results"),
      q("movement_results"),
      q("exercise_results"),
      q("pose_captures"),
      q("reports"),
      q("fisiovision_analyses"),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      clinic: (clinic.data as Record<string, unknown>) ?? null,
      patient: patient as Record<string, unknown>,
      consents: (consents.data as Array<Record<string, unknown>>) ?? [],
      assessments: (assessments.data as Array<Record<string, unknown>>) ?? [],
      posturalResults: (postural.data as Array<Record<string, unknown>>) ?? [],
      movementResults: (movement.data as Array<Record<string, unknown>>) ?? [],
      exerciseResults: (exercise.data as Array<Record<string, unknown>>) ?? [],
      poseCaptures: (poseCaps.data as Array<Record<string, unknown>>) ?? [],
      reports: (reports.data as Array<Record<string, unknown>>) ?? [],
      fisiovisionAnalyses: (fisio.data as Array<Record<string, unknown>>) ?? [],
    };
  });