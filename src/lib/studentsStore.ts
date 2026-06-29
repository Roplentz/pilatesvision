import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type NewStudentInput = Omit<
  Database["public"]["Tables"]["students"]["Insert"],
  "id" | "created_at"
>;

/** Lista alunos de uma clínica. Não dispara até clinicId existir. */
export function useStudents(clinicId: string | null | undefined) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(clinicId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clinicId) {
      setStudents([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("students")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(new Error(error.message));
        else setStudents((data ?? []) as StudentRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { students, loading, error };
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
  const { data, error } = await supabase
    .from("students")
    .insert(input)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as StudentRow;
}
