import { useSyncExternalStore } from "react";
import { mockAssessments } from "@/lib/mockData";
import type { Assessment, AssessmentStage, AssessmentStatus } from "@/types/models";

let assessments: Assessment[] = [...mockAssessments];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};

export function useAssessments(): Assessment[] {
  return useSyncExternalStore(subscribe, () => assessments, () => assessments);
}

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}

export interface NewAssessmentInput {
  studentId: string;
  professionalId: string;
  painLevel: number;
  mainComplaint?: string;
  observations?: string;
  goals: string[];
  status?: AssessmentStatus;
  currentStage?: AssessmentStage;
}

export function addAssessment(input: NewAssessmentInput): Assessment {
  const now = new Date().toISOString();
  const created: Assessment = {
    id: `ass-${Date.now().toString(36)}`,
    clinicId: "clinic-001",
    studentId: input.studentId,
    professionalId: input.professionalId,
    status: input.status ?? "draft",
    currentStage: input.currentStage ?? "ficha",
    painLevel: input.painLevel,
    mainComplaint: input.mainComplaint,
    observations: input.observations,
    goals: input.goals,
    createdAt: now,
    updatedAt: now,
  };
  assessments = [created, ...assessments];
  emit();
  return created;
}
