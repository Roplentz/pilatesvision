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

/** Busca uma clínica pelo id (sujeito a RLS — geralmente a do próprio usuário). */
export function useClinicById(id: string | null | undefined) {
  const [clinic, setClinic] = useState<ClinicRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setClinic(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("clinics")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setClinic((data as ClinicRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { clinic, loading, error };
}

/** Conta alunos e avaliações de uma clínica. */
export function useClinicCounts(clinicId: string | null | undefined) {
  const [counts, setCounts] = useState({ students: 0, assessments: 0 });
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));

  useEffect(() => {
    if (!clinicId) {
      setCounts({ students: 0, assessments: 0 });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId),
      supabase.from("assessments").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId),
    ]).then(([s, a]) => {
      if (cancelled) return;
      setCounts({ students: s.count ?? 0, assessments: a.count ?? 0 });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { counts, loading };
}

/** Vincula a clínica ao perfil do usuário (após criar a primeira clínica). */
export async function setProfileClinic(userId: string, clinicId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ clinic_id: clinicId })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}