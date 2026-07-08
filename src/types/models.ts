/**
 * Modelos de domínio do PilatesVision.
 *
 * Estes tipos representam o shape final esperado das entidades quando
 * a integração com Supabase for ativada. Servem como contrato único
 * entre UI, mocks atuais e futuras camadas de acesso a dados.
 *
 * Convenções:
 * - `id` sempre string (uuid em produção).
 * - Datas em ISO 8601 (`string`) para serialização consistente.
 * - Campos opcionais usam `?` quando podem ser nulos no banco.
 */

// ───────────────────────────────────────────────────────────────────────
// Enums / unions compartilhados
// ───────────────────────────────────────────────────────────────────────

export type Role = "owner" | "admin" | "professional" | "assistant";

export type ProfessionalSpecialty =
  | "Pilates"
  | "Fisioterapia"
  | "Educação Física"
  | "Osteopatia"
  | "RPG";

export type AssessmentStatus = "draft" | "in_review" | "finalized";

export type AssessmentType = "postural" | "dynamic" | "exercise" | "complete";

export type AssessmentStage = "ficha" | "postural" | "dinamica" | "exercicios" | "relatorio";

export type PostureView = "anterior" | "lateral" | "posterior";

export type ExerciseCategory = "Mat" | "Reformer" | "Funcional" | "Alongamento";

export type ExerciseLevel = "Iniciante" | "Intermediário" | "Avançado";

export type ExerciseGoal =
  | "Core"
  | "Mobilidade"
  | "Estabilidade"
  | "Força"
  | "Postura"
  | "Equilíbrio";

export type IdealView = "Lateral" | "Frontal" | "Posterior" | "Superior";

// ───────────────────────────────────────────────────────────────────────
// Clínica
// ───────────────────────────────────────────────────────────────────────

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  plan: "starter" | "pro" | "enterprise";
  createdAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Profissional
// ───────────────────────────────────────────────────────────────────────

export interface Professional {
  id: string;
  clinicId: string;
  userId?: string; // futuramente vinculado a auth.users
  name: string;
  email: string;
  phone?: string;
  role: Role;
  specialty: ProfessionalSpecialty;
  license?: string; // ex: CREFITO, CREF
  avatarUrl?: string;
  createdAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Aluno
// ───────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate: string; // ISO date
  gender: "F" | "M" | "outro";
  heightCm: number;
  weightKg: number;
  goals: string[];
  medicalHistory?: string;
  contraindications?: string[];
  avatarUrl?: string;
  createdAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Avaliação
// ───────────────────────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  clinicId: string;
  studentId: string;
  professionalId: string;
  status: AssessmentStatus;
  currentStage: AssessmentStage;
  painLevel: number; // 0–10
  mainComplaint?: string;
  observations?: string;
  goals: string[];
  postural?: PosturalResult;
  movement?: MovementResult;
  prescription?: PrescribedExercise[];
  report?: Report;
  createdAt: string;
  updatedAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Resultado postural
// ───────────────────────────────────────────────────────────────────────

export interface PosturalFinding {
  region: string; // ex: "Coluna cervical", "Pelve"
  description: string;
  severity: "leve" | "moderado" | "acentuado";
}

export interface PosturalShot {
  view: PostureView;
  imageUrl?: string;
  capturedAt: string;
}

export interface PosturalResult {
  id: string;
  assessmentId: string;
  shots: PosturalShot[];
  scores: {
    alignment: number; // 0–100
    symmetry: number;
    balance: number;
  };
  findings: PosturalFinding[];
  generatedAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Resultado dinâmico (movimento)
// ───────────────────────────────────────────────────────────────────────

export interface MovementMetric {
  label: string; // ex: "Controle", "Estabilidade"
  value: number; // 0–100
}

export interface MovementAnalysis {
  exerciseName: string;
  videoUrl?: string;
  metrics: MovementMetric[];
  compensations: string[];
  notes?: string;
}

export interface MovementResult {
  id: string;
  assessmentId: string;
  analyses: MovementAnalysis[];
  overallScore: number; // 0–100
  generatedAt: string;
}

// ───────────────────────────────────────────────────────────────────────
// Exercício prescrito
// ───────────────────────────────────────────────────────────────────────

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  level: ExerciseLevel;
  goal: ExerciseGoal;
  idealView: IdealView;
  description: string;
  joints: string[];
  qualityCriteria: string[];
  commonCompensations: string[];
}

export interface PrescribedExercise {
  id: string;
  assessmentId: string;
  exerciseId: string;
  sets: number;
  reps: number;
  tempo?: string; // ex: "3-1-3"
  notes?: string;
  order: number;
}

// ───────────────────────────────────────────────────────────────────────
// Relatório
// ───────────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  assessmentId: string;
  summary: string;
  recommendations: string[];
  nextReviewDate?: string;
  pdfUrl?: string;
  generatedAt: string;
  generatedBy: string; // professionalId
}
