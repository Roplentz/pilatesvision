/**
 * Cliente unificado para o motor de análise PilatesVision.
 *
 * Estratégia:
 * - Se `VITE_PILATESVISION_API_URL` estiver definido em build/runtime, chama a
 *   API Python externa (contrato em `docs/04_FASTAPI_CONTRACT.md`).
 * - Caso contrário, usa o fallback interno `/api/analyze-image` (Lovable AI
 *   Gateway → Gemini), produzindo um payload textual normalizado para as telas.
 *
 * As funções nunca lançam para a UI sem mensagem amigável.
 */

export type PosturalView = "anterior" | "lateral" | "posterior";

export interface PosturalPayload {
  assessmentId?: string;
  studentId?: string;
  clinicId?: string;
  view: PosturalView;
  image: string; // data:image/...
  context?: string;
}

export interface DynamicPayload {
  assessmentId?: string;
  studentId?: string;
  clinicId?: string;
  movement: string;
  /** Frame único (data URL) — usado no fallback enquanto vídeo não está ativo. */
  image?: string;
  /** Vídeo completo (data URL ou URL pública). Preferencial quando disponível. */
  video?: string;
  context?: string;
}

export interface ExercisePayload {
  assessmentId?: string;
  studentId?: string;
  clinicId?: string;
  exercise: string;
  image?: string;
  video?: string;
  context?: string;
}

export interface AnalysisFinding {
  region?: string;
  description: string;
  severity?: "leve" | "moderada" | "alta" | string;
}

export interface AnalysisResult {
  mode: "postural" | "dinamica" | "exercicio";
  score?: number;
  /** Texto livre — sempre presente, mesmo no fallback. */
  analysis: string;
  findings?: AnalysisFinding[];
  metrics?: Record<string, number>;
  alerts?: string[];
  annotatedImage?: string;
  confidence?: number;
  source: "python-api" | "lovable-ai";
  disclaimer: string;
}

const DISCLAIMER =
  "Resultado de apoio à decisão profissional. Não substitui avaliação clínica presencial.";

function externalBase(): string | null {
  const url = (import.meta.env.VITE_PILATESVISION_API_URL as string | undefined)?.trim();
  return url && url.length > 0 ? url.replace(/\/+$/, "") : null;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    const snippet = text.slice(0, 240) || `HTTP ${res.status}`;
    throw new Error(snippet);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Resposta inválida do servidor de análise.");
  }
}

async function fallbackAnalyzeImage(
  mode: "postural" | "dinamica" | "exercicio",
  image: string,
  context?: string,
): Promise<AnalysisResult> {
  if (!image || !image.startsWith("data:image/")) {
    throw new Error("Imagem inválida. Envie um JPG, PNG ou WebP.");
  }
  const data = await postJson<{ analysis: string }>("/api/analyze-image", {
    image,
    mode,
    context,
  });
  return {
    mode,
    analysis: data.analysis,
    source: "lovable-ai",
    disclaimer: DISCLAIMER,
  };
}

function normalizeExternal(
  raw: Partial<AnalysisResult> & { analysis?: string; summary?: string },
  mode: AnalysisResult["mode"],
): AnalysisResult {
  return {
    mode,
    score: raw.score,
    analysis: raw.analysis ?? raw.summary ?? "",
    findings: raw.findings,
    metrics: raw.metrics,
    alerts: raw.alerts,
    annotatedImage: raw.annotatedImage,
    confidence: raw.confidence,
    source: "python-api",
    disclaimer: raw.disclaimer ?? DISCLAIMER,
  };
}

export async function analyzePosturalImage(payload: PosturalPayload): Promise<AnalysisResult> {
  const base = externalBase();
  if (base) {
    try {
      const raw = await postJson<Partial<AnalysisResult>>(
        `${base}/analyze/postural-image`,
        payload,
      );
      return normalizeExternal(raw, "postural");
    } catch (err) {
      // Cai para o fallback de IA — mantém UX funcional.
      console.warn("[pilatesVisionApi] postural externo falhou, usando fallback:", err);
    }
  }
  return fallbackAnalyzeImage(
    "postural",
    payload.image,
    payload.context ?? `Vista: ${payload.view}`,
  );
}

export async function analyzeDynamicVideo(payload: DynamicPayload): Promise<AnalysisResult> {
  const base = externalBase();
  if (base && payload.video) {
    try {
      const raw = await postJson<Partial<AnalysisResult>>(`${base}/analyze/dynamic-video`, payload);
      return normalizeExternal(raw, "dinamica");
    } catch (err) {
      console.warn("[pilatesVisionApi] dinâmico externo falhou, usando fallback:", err);
    }
  }
  if (!payload.image) {
    throw new Error(
      "Análise de vídeo ainda não disponível. Envie um frame (imagem) do movimento como alternativa.",
    );
  }
  return fallbackAnalyzeImage(
    "dinamica",
    payload.image,
    payload.context ?? `Movimento: ${payload.movement}`,
  );
}

export async function analyzeExerciseVideo(payload: ExercisePayload): Promise<AnalysisResult> {
  const base = externalBase();
  if (base && payload.video) {
    try {
      const raw = await postJson<Partial<AnalysisResult>>(
        `${base}/analyze/exercise-video`,
        payload,
      );
      return normalizeExternal(raw, "exercicio");
    } catch (err) {
      console.warn("[pilatesVisionApi] exercício externo falhou, usando fallback:", err);
    }
  }
  if (!payload.image) {
    throw new Error("Análise de vídeo ainda não disponível. Envie um frame (imagem) do exercício.");
  }
  return fallbackAnalyzeImage(
    "exercicio",
    payload.image,
    payload.context ?? `Exercício: ${payload.exercise}`,
  );
}

export const pilatesVisionApi = {
  analyzePosturalImage,
  analyzeDynamicVideo,
  analyzeExerciseVideo,
  isExternalConfigured: () => externalBase() !== null,
  disclaimer: DISCLAIMER,
};
