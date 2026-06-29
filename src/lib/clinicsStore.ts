import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClinicRow {
  id: string;
  name: string;
  owner_user_id: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface NewClinicInput {
  name: string;
  owner_user_id: string;
  city?: string | null;
  state?: string | null;
}

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
      if (profileError) { setError(new Error(profileError.message)); setLoading(false); return; }
      const cid = (profile as any)?.clinic_id as string | null ?? null;
      setClinicId(cid);
      if (!cid) { setClinic(null); setLoading(false); return; }
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", cid)
        .maybeSingle();
      if (cancelled) return;
      if (clinicError) setError(new Error(clinicError.message));
      else setClinic((clinicData as unknown as ClinicRow | null) ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return { clinic, clinicId, loading, error };
}

export async function createClinic(input: NewClinicInput): Promise<ClinicRow> {
  const { data, error } = await supabase
    .from("clinics")
    .insert({ name: input.name, owner_user_id: input.owner_user_id, city: input.city ?? null, state: input.state ?? null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ClinicRow;
}

export async function setProfileClinic(userId: string, clinicId: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ clinic_id: clinicId } as any).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function updateClinic(id: string, input: Partial<Omit<NewClinicInput, 'owner_user_id'>>): Promise<void> {
  const { error } = await supabase.from("clinics").update(input as any).eq("id", id);
  if (error) throw new Error(error.message);
}
