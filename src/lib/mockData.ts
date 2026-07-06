/**
 * Dados fictícios usados pela UI enquanto a integração com Lovable Cloud
 * (Supabase) não está ativa. Toda a aplicação deve consumir estes mocks
 * através das helpers abaixo, para que a troca para fetch real seja
 * isolada em um único ponto.
 */

import type {
  Assessment,
  Clinic,
  ExerciseDefinition,
  MovementResult,
  PosturalResult,
  PrescribedExercise,
  Professional,
  Report,
  Student,
} from "@/types/models";

// ───────────────────────────────────────────────────────────────────────
// Clínica
// ───────────────────────────────────────────────────────────────────────

export const mockClinic: Clinic = {
  id: "clinic-001",
  name: "Studio PilatesVision São Paulo",
  slug: "kinetik-sp",
  email: "contato@kinetik.studio",
  phone: "+55 11 99999-0000",
  plan: "pro",
  address: {
    street: "Rua Oscar Freire, 1200",
    city: "São Paulo",
    state: "SP",
    zip: "01426-001",
    country: "BR",
  },
  createdAt: "2025-01-15T10:00:00.000Z",
};

// ───────────────────────────────────────────────────────────────────────
// Profissionais
// ───────────────────────────────────────────────────────────────────────

export const mockProfessionals: Professional[] = [
  {
    id: "prof-001",
    clinicId: mockClinic.id,
    name: "Dra. Marina Castro",
    email: "marina@kinetik.studio",
    phone: "+55 11 98888-1111",
    role: "owner",
    specialty: "Fisioterapia",
    license: "CREFITO-3 123456",
    createdAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "prof-002",
    clinicId: mockClinic.id,
    name: "Rafael Lima",
    email: "rafael@kinetik.studio",
    role: "professional",
    specialty: "Pilates",
    license: "CREF 098765-G/SP",
    createdAt: "2025-02-01T10:00:00.000Z",
  },
  {
    id: "prof-003",
    clinicId: mockClinic.id,
    name: "Juliana Prado",
    email: "juliana@kinetik.studio",
    role: "professional",
    specialty: "Pilates",
    createdAt: "2025-03-10T10:00:00.000Z",
  },
];

// ───────────────────────────────────────────────────────────────────────
// Alunos
// ───────────────────────────────────────────────────────────────────────

export const mockStudents: Student[] = [
  {
    id: "stu-001",
    clinicId: mockClinic.id,
    name: "Ana Beatriz Souza",
    email: "ana.souza@email.com",
    phone: "+55 11 97777-2222",
    birthDate: "1991-04-12",
    gender: "F",
    heightCm: 168,
    weightKg: 62,
    goals: ["Melhorar postura", "Reduzir dor lombar"],
    medicalHistory: "Lombalgia crônica há 3 anos. Sem cirurgias.",
    contraindications: ["Carga axial acima de 10kg"],
    createdAt: "2025-04-02T10:00:00.000Z",
  },
  {
    id: "stu-002",
    clinicId: mockClinic.id,
    name: "Carlos Henrique Mota",
    email: "carlos.mota@email.com",
    birthDate: "1985-09-22",
    gender: "M",
    heightCm: 178,
    weightKg: 84,
    goals: ["Mobilidade torácica", "Força de core"],
    medicalHistory: "Hérnia discal L5-S1 estável.",
    createdAt: "2025-04-10T10:00:00.000Z",
  },
  {
    id: "stu-003",
    clinicId: mockClinic.id,
    name: "Patrícia Lemos",
    birthDate: "1996-12-01",
    gender: "F",
    heightCm: 162,
    weightKg: 55,
    goals: ["Performance esportiva", "Equilíbrio"],
    createdAt: "2025-05-18T10:00:00.000Z",
  },
  {
    id: "stu-004",
    clinicId: mockClinic.id,
    name: "Felipe Andrade",
    birthDate: "1978-06-30",
    gender: "M",
    heightCm: 182,
    weightKg: 91,
    goals: ["Reabilitação ombro direito"],
    medicalHistory: "Pós-operatório de manguito rotador (6 meses).",
    contraindications: ["Abdução acima de 120° com carga"],
    createdAt: "2025-06-01T10:00:00.000Z",
  },
];

// ───────────────────────────────────────────────────────────────────────
// Catálogo de exercícios (definições reutilizáveis)
// ───────────────────────────────────────────────────────────────────────

export const mockExerciseCatalog: ExerciseDefinition[] = [
  {
    id: "ex-hundred",
    name: "Hundred",
    category: "Mat",
    level: "Intermediário",
    goal: "Core",
    idealView: "Lateral",
    description:
      "Ativação do powerhouse em decúbito dorsal com bombeamento dos braços e respiração coordenada.",
    joints: ["Coluna cervical", "Coluna torácica", "Coxofemoral", "Ombros"],
    qualityCriteria: ["Cabeça alinhada com o tronco", "Escápulas estabilizadas", "Pelve neutra"],
    commonCompensations: ["Hiperextensão cervical", "Elevação dos ombros"],
  },
  {
    id: "ex-roll-up",
    name: "Roll Up",
    category: "Mat",
    level: "Intermediário",
    goal: "Mobilidade",
    idealView: "Lateral",
    description: "Articulação vértebra por vértebra com controle excêntrico do core.",
    joints: ["Coluna lombar", "Coluna torácica", "Coxofemoral"],
    qualityCriteria: ["Sequenciamento contínuo", "Pés ancorados"],
    commonCompensations: ["Impulso de pescoço", "Salto em bloco"],
  },
  {
    id: "ex-shoulder-bridge",
    name: "Shoulder Bridge",
    category: "Mat",
    level: "Iniciante",
    goal: "Estabilidade",
    idealView: "Lateral",
    description: "Ponte com elevação pélvica articulada e ativação de glúteos.",
    joints: ["Coxofemoral", "Coluna lombar", "Joelho"],
    qualityCriteria: ["Linha ombro-quadril-joelho", "Cervical relaxada"],
    commonCompensations: ["Hiperextensão lombar", "Joelhos em valgo"],
  },
  {
    id: "ex-swan",
    name: "Swan",
    category: "Mat",
    level: "Intermediário",
    goal: "Postura",
    idealView: "Lateral",
    description: "Extensão de coluna em decúbito ventral para abertura torácica.",
    joints: ["Coluna torácica", "Coluna lombar", "Ombros"],
    qualityCriteria: ["Extensão distribuída", "Escápulas em depressão"],
    commonCompensations: ["Extensão concentrada na lombar"],
  },
  {
    id: "ex-spine-stretch",
    name: "Spine Stretch",
    category: "Alongamento",
    level: "Iniciante",
    goal: "Mobilidade",
    idealView: "Lateral",
    description: "Flexão articulada da coluna sentado com pernas estendidas.",
    joints: ["Coluna torácica", "Coluna lombar", "Coxofemoral"],
    qualityCriteria: ["Flexão articulada", "Ísquios ancorados"],
    commonCompensations: ["Cabeça projetada à frente"],
  },
];

// ───────────────────────────────────────────────────────────────────────
// Avaliação completa de exemplo
// ───────────────────────────────────────────────────────────────────────

export const mockPosturalResult: PosturalResult = {
  id: "post-001",
  assessmentId: "ass-001",
  shots: [
    { view: "anterior", capturedAt: "2026-06-20T14:02:00.000Z" },
    { view: "lateral", capturedAt: "2026-06-20T14:03:00.000Z" },
    { view: "posterior", capturedAt: "2026-06-20T14:04:00.000Z" },
  ],
  scores: { alignment: 78, symmetry: 84, balance: 72 },
  findings: [
    {
      region: "Coluna cervical",
      description: "Anteriorização de cabeça de aproximadamente 18°.",
      severity: "moderado",
    },
    {
      region: "Pelve",
      description: "Leve báscula anterior, 6° além da neutra.",
      severity: "leve",
    },
    {
      region: "Ombros",
      description: "Protração bilateral simétrica.",
      severity: "leve",
    },
  ],
  generatedAt: "2026-06-20T14:05:00.000Z",
};

export const mockMovementResult: MovementResult = {
  id: "mov-001",
  assessmentId: "ass-001",
  overallScore: 81,
  analyses: [
    {
      exerciseName: "Roll Up",
      metrics: [
        { label: "Controle", value: 82 },
        { label: "Estabilidade", value: 78 },
        { label: "Simetria", value: 88 },
        { label: "Amplitude", value: 74 },
      ],
      compensations: ["Impulso cervical leve na fase concêntrica"],
    },
    {
      exerciseName: "Hundred",
      metrics: [
        { label: "Controle", value: 86 },
        { label: "Estabilidade", value: 80 },
        { label: "Simetria", value: 91 },
        { label: "Amplitude", value: 70 },
      ],
      compensations: ["Elevação do trapézio superior após 30s"],
    },
  ],
  generatedAt: "2026-06-20T14:18:00.000Z",
};

export const mockPrescription: PrescribedExercise[] = [
  {
    id: "presc-001",
    assessmentId: "ass-001",
    exerciseId: "ex-shoulder-bridge",
    sets: 3,
    reps: 10,
    tempo: "3-1-3",
    order: 1,
    notes: "Foco em ativação glútea antes de elevar a pelve.",
  },
  {
    id: "presc-002",
    assessmentId: "ass-001",
    exerciseId: "ex-spine-stretch",
    sets: 2,
    reps: 8,
    order: 2,
  },
  {
    id: "presc-003",
    assessmentId: "ass-001",
    exerciseId: "ex-swan",
    sets: 2,
    reps: 6,
    order: 3,
    notes: "Distribuir extensão pela torácica.",
  },
];

export const mockReport: Report = {
  id: "rep-001",
  assessmentId: "ass-001",
  summary:
    "Aluna apresenta padrão postural com anteriorização cervical moderada e báscula pélvica anterior leve. Performance dinâmica boa, com simetria preservada. Indicado plano de 4 semanas com foco em fortalecimento de cadeia posterior profunda e mobilidade torácica.",
  recommendations: [
    "Plano de 3 sessões semanais por 4 semanas",
    "Reavaliação postural em 30 dias",
    "Trabalho domiciliar de mobilidade cervical (5 min/dia)",
  ],
  nextReviewDate: "2026-07-20",
  generatedAt: "2026-06-20T14:30:00.000Z",
  generatedBy: "prof-002",
};

export const mockAssessments: Assessment[] = [
  {
    id: "ass-001",
    clinicId: mockClinic.id,
    studentId: "stu-001",
    professionalId: "prof-002",
    status: "completed",
    currentStage: "relatorio",
    painLevel: 4,
    mainComplaint: "Dor lombar ao final do dia",
    observations: "Trabalho sedentário, ~9h sentada por dia.",
    goals: ["Reduzir dor lombar", "Melhorar postura"],
    postural: mockPosturalResult,
    movement: mockMovementResult,
    prescription: mockPrescription,
    report: mockReport,
    createdAt: "2026-06-20T14:00:00.000Z",
    updatedAt: "2026-06-20T14:30:00.000Z",
  },
  {
    id: "ass-002",
    clinicId: mockClinic.id,
    studentId: "stu-002",
    professionalId: "prof-003",
    status: "in_progress",
    currentStage: "dinamica",
    painLevel: 2,
    goals: ["Mobilidade torácica"],
    createdAt: "2026-06-25T09:00:00.000Z",
    updatedAt: "2026-06-28T09:30:00.000Z",
  },
  {
    id: "ass-003",
    clinicId: mockClinic.id,
    studentId: "stu-003",
    professionalId: "prof-002",
    status: "draft",
    currentStage: "ficha",
    painLevel: 0,
    goals: ["Performance esportiva"],
    createdAt: "2026-06-28T16:00:00.000Z",
    updatedAt: "2026-06-28T16:00:00.000Z",
  },
];

// ───────────────────────────────────────────────────────────────────────
// Helpers de acesso (substituir por queries Supabase no futuro)
// ───────────────────────────────────────────────────────────────────────

export const mockApi = {
  getClinic: () => mockClinic,
  listProfessionals: () => mockProfessionals,
  listStudents: () => mockStudents,
  getStudent: (id: string) => mockStudents.find((s) => s.id === id),
  listAssessments: () => mockAssessments,
  getAssessment: (id: string) => mockAssessments.find((a) => a.id === id),
  listExercises: () => mockExerciseCatalog,
  getExercise: (id: string) => mockExerciseCatalog.find((e) => e.id === id),
};
