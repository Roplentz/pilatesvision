import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
export type NewPatientInput = Omit<
  Database["public"]["Tables"]["patients"]["Insert"],
  "id" | "created_at"
>;
export type UpdatePatientInput = Database["public"]["Tables"]["patients"]["Update"];

export type PatientStatus = "active" | "inactive" | "archived";

/** Lista pacientes de uma clínica com filtro opcional de status. */
export function usePatients(
  clinicId: string | null | undefined,
  options?: { status?: PatientStatus | "all" },
) {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const statusFilter = options?.status ?? "active";

  useEffect(() => {
    if (!clinicId) {
      setPatients([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("patients")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("updated_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(new Error(error.message));
      else setPatients((data ?? []) as PatientRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clinicId, statusFilter, reloadKey]);

  return { patients, loading, error, reload: () => setReloadKey((k) => k + 1) };
}

/** Busca um único paciente pelo id. */
export function usePatient(id: string | null | undefined) {
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setPatient(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setPatient((data as PatientRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { patient, loading, error };
}

/** Insere um novo paciente. clinic_id deve vir do perfil do usuário logado. */
export async function createPatient(input: NewPatientInput): Promise<PatientRow> {
  const { data, error } = await supabase.from("patients").insert(input).select("*").single();
  if (error) throw new Error(error.message);
  return data as PatientRow;
}

/** Atualiza dados básicos de um paciente. clinic_id nunca é alterado. */
export async function updatePatient(id: string, patch: UpdatePatientInput): Promise<PatientRow> {
  const safe: UpdatePatientInput = { ...patch };
  delete (safe as { clinic_id?: string }).clinic_id;
  const { data, error } = await supabase
    .from("patients")
    .update(safe)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PatientRow;
}

/** Arquiva o paciente (soft delete). */
export async function archivePatient(id: string): Promise<void> {
  const { error } = await supabase.from("patients").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Contagens de pacientes por status (ativos, arquivados, inativos). */
export function usePatientCounts(clinicId: string | null | undefined) {
  const [counts, setCounts] = useState({ active: 0, inactive: 0, archived: 0 });
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));

  useEffect(() => {
    if (!clinicId) {
      setCounts({ active: 0, inactive: 0, archived: 0 });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      const [a, i, ar] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("status", "active"),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("status", "inactive"),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("status", "archived"),
      ]);
      if (cancelled) return;
      setCounts({
        active: a.count ?? 0,
        inactive: i.count ?? 0,
        archived: ar.count ?? 0,
      });
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { counts, loading };
}
