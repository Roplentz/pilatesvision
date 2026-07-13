// Contrato compartilhado com a API assíncrona do FisioVision.
// Referência: docs/04_FASTAPI_CONTRACT.md

export const FISIOVISION_ALLOWED_EXERCISES = [
  "pilates-the-hundred",
  "pilates-single-leg-stretch",
  "pilates-swimming",
  "pilates-swan",
  "pilates-teaser",
] as const;

export type FisiovisionExerciseId = (typeof FISIOVISION_ALLOWED_EXERCISES)[number];

export const FISIOVISION_EXERCISE_LABELS: Record<FisiovisionExerciseId, string> = {
  "pilates-the-hundred": "The Hundred",
  "pilates-single-leg-stretch": "Single Leg Stretch",
  "pilates-swimming": "Swimming",
  "pilates-swan": "Swan",
  "pilates-teaser": "Teaser",
};

export type FisiovisionAnalysisStatus = "queued" | "processing" | "completed" | "failed";

export type FisiovisionJson =
  | string
  | number
  | boolean
  | null
  | { [k: string]: FisiovisionJson }
  | FisiovisionJson[];

export interface FisiovisionAnalysisDTO {
  id: string;
  status: FisiovisionAnalysisStatus;
  exerciseId: FisiovisionExerciseId | string;
  result: FisiovisionJson | null;
  error: { code?: string; message?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FisiovisionCreateInput {
  exerciseId: FisiovisionExerciseId;
  videoPath: string; // path dentro do bucket clinical-media
  assessmentId?: string | null;
  patientId?: string | null;
}

/** Erros server → cliente traduzidos para PT-BR. */
export const FISIOVISION_ERROR_MESSAGES: Record<string, string> = {
  bad_request: "Requisição inválida enviada ao serviço de análise.",
  unauthorized: "Não autenticado para acessar o serviço de análise.",
  forbidden: "Você não tem permissão para acessar este vídeo.",
  not_found: "Análise não encontrada.",
  rate_limited: "Muitas análises em andamento. Aguarde alguns instantes e tente novamente.",
  service_unavailable:
    "Serviço de análise temporariamente indisponível. Tente novamente em instantes.",
  config_missing: "Integração de análise não configurada.",
  invalid_exercise: "Exercício não liberado para análise automática.",
  invalid_video_path: "Vídeo fora do escopo permitido.",
  invalid_video: "O arquivo precisa ser um vídeo MP4, MOV ou WEBM de até 50MB.",
  upstream_error: "Falha ao comunicar com o serviço de análise.",
};

export function translateFisiovisionError(code: string | undefined): string {
  if (!code) return "Falha inesperada ao processar análise.";
  return FISIOVISION_ERROR_MESSAGES[code] ?? "Falha inesperada ao processar análise.";
}
