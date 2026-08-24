export type QualityDimensionId =
  | "geometric"
  | "temporal"
  | "symmetry"
  | "smoothness"
  | "compensation"
  | "completeness";

export interface QualityDimensionInput {
  id: QualityDimensionId;
  score?: number;
  confidence: number;
  weight: number;
  status?: "valid" | "low-confidence" | "unavailable";
  reasons?: string[];
}

export interface QualityDimensionResult extends QualityDimensionInput {
  status: "valid" | "low-confidence" | "unavailable";
}

export interface MovementQualityScore {
  overall?: number;
  confidence: number;
  coverage: number;
  dimensions: QualityDimensionResult[];
  status: "valid" | "partial" | "unavailable";
  reasons: string[];
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const clamp100 = (value: number) => Math.max(0, Math.min(100, value));

export function calculateMovementQuality(
  inputs: QualityDimensionInput[],
  minimumConfidence = 0.5,
): MovementQualityScore {
  const reasons: string[] = [];
  const dimensions = inputs.map<QualityDimensionResult>((input) => {
    const unavailable = input.score === undefined || !Number.isFinite(input.score) || input.weight <= 0;
    const confidence = clamp01(input.confidence);
    return {
      ...input,
      score: unavailable ? undefined : clamp100(input.score!),
      confidence,
      status: unavailable
        ? "unavailable"
        : confidence < minimumConfidence
          ? "low-confidence"
          : input.status ?? "valid",
    };
  });

  const declaredWeight = inputs.reduce((sum, input) => sum + Math.max(0, input.weight), 0);
  const usable = dimensions.filter((item) => item.status !== "unavailable" && item.score !== undefined);
  const usableWeight = usable.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  const coverage = declaredWeight > 0 ? clamp01(usableWeight / declaredWeight) : 0;

  if (!usable.length || usableWeight <= 0) {
    return { overall: undefined, confidence: 0, coverage, dimensions, status: "unavailable", reasons: ["no_usable_dimensions"] };
  }

  const weightedScore = usable.reduce((sum, item) => sum + item.score! * item.weight, 0) / usableWeight;
  const confidence = usable.reduce((sum, item) => sum + item.confidence * item.weight, 0) / usableWeight;

  if (coverage < 1) reasons.push("partial_dimension_coverage");
  if (usable.some((item) => item.status === "low-confidence")) reasons.push("low_confidence_dimension");

  return {
    overall: clamp100(weightedScore),
    confidence: clamp01(confidence),
    coverage,
    dimensions,
    status: coverage < 1 || confidence < minimumConfidence ? "partial" : "valid",
    reasons,
  };
}
