import { useSyncExternalStore } from "react";
import { mockStudents } from "@/lib/mockData";
import type { Student } from "@/types/models";

/**
 * Store local de alunos (in-memory) — inicializado a partir dos mocks.
 * Será substituído por queries Supabase quando a integração for ativada.
 * Persiste apenas durante a sessão do navegador.
 */

let students: Student[] = [...mockStudents];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};

export function useStudents(): Student[] {
  return useSyncExternalStore(subscribe, () => students, () => students);
}

export function getStudent(id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export type NewStudentInput = Omit<Student, "id" | "clinicId" | "createdAt">;

export function addStudent(input: NewStudentInput): Student {
  const created: Student = {
    ...input,
    id: `stu-${Date.now().toString(36)}`,
    clinicId: "clinic-001",
    createdAt: new Date().toISOString(),
  };
  students = [created, ...students];
  emit();
  return created;
}
