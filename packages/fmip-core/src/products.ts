import type { AssessmentDomain } from "./schema";

export interface FmipProductDefinition {
  id: string;
  name: string;
  domain: AssessmentDomain;
  description: string;
  requiredStages: string[];
}

export const FMIP_PRODUCTS: readonly FmipProductDefinition[] = [
  {
    id: "pilatesvision",
    name: "PilatesVision",
    domain: "pilates",
    description: "Avaliação de exercícios de Pilates e movimento funcional.",
    requiredStages: [
      "capture",
      "quality",
      "pose",
      "motion",
      "events",
      "biomechanics",
      "protocol",
      "clinical-review",
      "report",
    ],
  },
  {
    id: "posturevision",
    name: "PostureVision",
    domain: "posture",
    description: "Triagem postural frontal e sagital com qualidade de captura explícita.",
    requiredStages: [
      "capture",
      "quality",
      "pose",
      "biomechanics",
      "protocol",
      "clinical-review",
      "report",
    ],
  },
  {
    id: "gaitvision",
    name: "GaitVision",
    domain: "gait",
    description: "Avaliação temporal e cinemática da marcha por vídeo e sensores.",
    requiredStages: [
      "capture",
      "quality",
      "pose",
      "motion",
      "events",
      "biomechanics",
      "protocol",
      "clinical-review",
      "report",
    ],
  },
  {
    id: "sportsvision",
    name: "SportsVision",
    domain: "sports",
    description: "Análise de movimentos esportivos e retorno funcional.",
    requiredStages: [
      "capture",
      "quality",
      "pose",
      "motion",
      "events",
      "biomechanics",
      "protocol",
      "clinical-review",
      "report",
    ],
  },
] as const;

export function getFmipProduct(id: string): FmipProductDefinition | undefined {
  return FMIP_PRODUCTS.find((product) => product.id === id);
}
