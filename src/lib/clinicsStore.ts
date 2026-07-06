import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClinicAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ClinicRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: ClinicAddress | null;
  city?: string | null;
  state?: string | null;
  plan: string | null;
  owner_user_id?: string | null;
  created_at: string;
}

export interface NewClinicInput {
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  plan?: string;
  address?: ClinicAddress | null;
  city?: string | null;
  state?: string | null;
  owner_user_id?: string | null;
}

type ProfileClinicRow = {
  clinic_id: string | null;
};

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

    const loadClinic = async () => {
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

      const cid = (profile as ProfileClinicRow | null)?.clinic_id ?? null;

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

      if (clinicError) {
        setError(new Error(clinicError.message));
      } else {
        setClinic((clinicData as unknown as ClinicRow | null) ?? null);
      }

      setLoading(false);
    };

    void loadClinic();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { clinic, clinicId, loading, error };
}

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
    setError(null);

    const loadClinic = async () => {
      const { data, error: clinicError } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (clinicError) {
        setError(new Error(clinicError.message));
      } else {
        setClinic((data as unknown as ClinicRow | null) ?? null);
      }

      setLoading(false);
    };

    void loadClinic();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { clinic, loading, error };
}

export interface ClinicCounts {
  students: number;
  assessments: number;
  reports: number;
}

export function useClinicCounts(clinicId: string | null | undefined) {
  const [counts, setCounts] = useState<ClinicCounts>({
    students: 0,
    assessments: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));

  useEffect(() => {
    if (!clinicId) {
      setCounts({ students: 0, assessments: 0, reports: 0 });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadCounts = async () => {
      const [studentsResult, assessmentsResult, reportsResult] = await Promise.all([
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId),
        supabase
          .from("assessments")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId),
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId),
      ]);

      if (cancelled) return;

      setCounts({
        students: studentsResult.count ?? 0,
        assessments: assessmentsResult.count ?? 0,
        reports: reportsResult.count ?? 0,
      });

      setLoading(false);
    };

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { counts, loading };
}

export async function createClinic(input: NewClinicInput): Promise<ClinicRow> {
  const payload: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    email: input.email ?? null,
    phone: input.phone ?? null,
    plan: input.plan ?? "starter",
    address: input.address ?? null,
    city: input.city ?? input.address?.city ?? null,
    state: input.state ?? input.address?.state ?? null,
    owner_user_id: input.owner_user_id ?? null,
  };

  const { data, error } = await supabase
    .from("clinics")
    .insert(payload as never)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ClinicRow;
}

export async function setProfileClinic(userId: string, clinicId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ clinic_id: clinicId } as unknown as never)
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateClinic(id: string, input: Partial<NewClinicInput>): Promise<void> {
  const { error } = await supabase
    .from("clinics")
    .update(input as unknown as never)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
