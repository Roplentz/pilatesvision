import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type NewStudentInput = Omit<
  Database["public"]["Tables"]["students"]["Insert"],
  "id" | "created_at"
>;
export type UpdateStudentInput = Database["public"]["Tables"]["students"]["Update"];

export type StudentStatus = "active" | "inactive" | "archived";

/** Lista alunos de uma clínica com filtro opcional de status. */
export function useStudents(
  clinicId: string | null | undefined,
  options?: { status?: StudentStatus | "all" },
) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const statusFilter = options?.status ?? "active";

  useEffect(() => {
    if (!clinicId) {
      setStudents([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    let query = supabase
      .from("students")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("updated_at", { ascending: false });
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(new Error(error.message));
      else setStudents((data ?? []) as StudentRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clinicId, statusFilter, reloadKey]);

  return { students, loading, error, reload: () => setReloadKey((k) => k + 1) };
}

/** Busca um único aluno pelo id. */
export function useStudent(id: string | null | undefined) {
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setStudent(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setStudent((data as StudentRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { student, loading, error };
}

/** Insere um novo aluno. clinic_id deve vir do perfil do usuário logado. */
export async function createStudent(input: NewStudentInput): Promise<StudentRow> {
  const { data, error } = await supabase.from("students").insert(input).select("*").single();
  if (error) throw new Error(error.message);
  return data as StudentRow;
}

/** Atualiza dados básicos de um aluno. clinic_id nunca é alterado. */
export async function updateStudent(id: string, patch: UpdateStudentInput): Promise<StudentRow> {
  const safe: UpdateStudentInput = { ...patch };
  delete (safe as { clinic_id?: string }).clinic_id;
  const { data, error } = await supabase
    .from("students")
    .update(safe)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as StudentRow;
}

/** Arquiva o aluno (soft delete). */
export async function archiveStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Contagens de alunos por status (ativos, arquivados, inativos). */
export function useStudentCounts(clinicId: string | null | undefined) {
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
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("status", "active"),
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinicId)
          .eq("status", "inactive"),
        supabase
          .from("students")
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
