import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ClinicRow = Database["public"]["Tables"]["clinics"]["Row"];
export type NewClinicInput = Omit<
  Database["public"]["Tables"]["clinics"]["Insert"],
  "id" | "created_at"
>;

/**
 * Busca a clínica do usuário logado: lê profiles.clinic_id e depois a clínica.
 */
export function useClinic(userId: string | null | undefined) {
  const [clinic, setClinic] = useState<ClinicRow | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setClinic(null);
      setClinicId(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (profileError) {
        setError(new Error(profileError.message));
        setLoading(false);
        return;
      }

      const cid = (profile?.clinic_id as string | null | undefined) ?? null;
      setClinicId(cid);

      if (!cid) {
        setClinic(null);
        setLoading(false);
        return;
      }

      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", cid)
        .maybeSingle();

      if (cancelled) return;
      if (clinicError) setError(new Error(clinicError.message));
      else setClinic((clinicData as ClinicRow | null) ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { clinic, clinicId, loading, error };
}

/** Cria a clínica do primeiro acesso. */
export async function createClinic(input: NewClinicInput): Promise<ClinicRow> {
  const { data, error } = await supabase
    .from("clinics")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ClinicRow;
}