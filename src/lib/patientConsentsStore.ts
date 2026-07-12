import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PatientConsentRow = Database["public"]["Tables"]["patient_consents"]["Row"];

export const CONSENT_TEXT_V1 =
  "Autorizo a coleta e o uso de imagens e vídeos meus (dados biométricos sensíveis) exclusivamente para fins de avaliação, acompanhamento clínico e apoio à decisão pelo profissional responsável, nos termos da LGPD. Este consentimento pode ser revogado a qualquer momento.";

export interface UsePatientConsentResult {
  consent: PatientConsentRow | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function usePatientConsent(patientId: string | null | undefined): UsePatientConsentResult {
  const [consent, setConsent] = useState<PatientConsentRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(patientId));
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!patientId) {
      setConsent(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("patient_consents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) setError(new Error(error.message));
    else setConsent((data as PatientConsentRow | null) ?? null);
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { consent, loading, error, reload: load };
}

export interface SaveConsentInput {
  patientId: string;
  clinicId: string;
  professionalId: string | null;
  consentLgpd: boolean;
  consentImageUse: boolean;
  consentAiSupport: boolean;
  existingId?: string | null;
}

export async function savePatientConsent(input: SaveConsentInput): Promise<PatientConsentRow> {
  const acceptedAt =
    input.consentLgpd || input.consentImageUse || input.consentAiSupport
      ? new Date().toISOString()
      : null;

  const payload = {
    patient_id: input.patientId,
    clinic_id: input.clinicId,
    responsible_professional_id: input.professionalId,
    consent_lgpd: input.consentLgpd,
    consent_image_use: input.consentImageUse,
    consent_ai_support: input.consentAiSupport,
    consent_text: CONSENT_TEXT_V1,
    accepted_at: acceptedAt,
  };

  if (input.existingId) {
    const { data, error } = await supabase
      .from("patient_consents")
      .update(payload)
      .eq("id", input.existingId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as PatientConsentRow;
  }

  const { data, error } = await supabase
    .from("patient_consents")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PatientConsentRow;
}
