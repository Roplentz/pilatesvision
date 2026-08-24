export type MetricAvailability = "valid" | "low-confidence" | "unavailable";

export interface MetricRequirementResult {
  id: string;
  met: boolean;
  confidence?: number;
}

export interface MetricConfidenceInput {
  metricId: string;
  value?: number;
  sourceConfidence?: number;
  captureConfidence?: number;
  requirements?: MetricRequirementResult[];
  minimumConfidence: number;
}

export interface MetricConfidenceResult {
  metricId: string;
  value?: number;
  confidence: number;
  status: MetricAvailability;
  missingRequirements: string[];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function assessMetricConfidence(input: MetricConfidenceInput): MetricConfidenceResult {
  const requirements = input.requirements ?? [];
  const missingRequirements = requirements.filter((item) => !item.met).map((item) => item.id);

  if (input.value === undefined || missingRequirements.length > 0) {
    return {
      metricId: input.metricId,
      value: input.value,
      confidence: 0,
      status: "unavailable",
      missingRequirements,
    };
  }

  const confidences = [input.sourceConfidence, input.captureConfidence, ...requirements.map((item) => item.confidence)]
    .filter((value): value is number => value !== undefined)
    .map(clamp01);

  const confidence = confidences.length === 0
    ? 1
    : confidences.reduce((product, value) => product * value, 1) ** (1 / confidences.length);

  return {
    metricId: input.metricId,
    value: input.value,
    confidence,
    status: confidence >= input.minimumConfidence ? "valid" : "low-confidence",
    missingRequirements,
  };
}
