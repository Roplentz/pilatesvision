import { calculateMovementQuality, type MovementQualityScore, type QualityDimensionInput } from "./movement-quality";
import { calculateCalibrationGap, type MovementCalibration, type MovementPerception } from "./perception";

export const SQUAT_ASSESSMENT_V1 = "fisiohub.squat-assessment@1.0.0" as const;

export interface NumericTargetRange {
  min?: number;
  max?: number;
  tolerance?: number;
}

export interface SquatAssessmentV1Protocol {
  id: typeof SQUAT_ASSESSMENT_V1;
  minimumConfidence: number;
  targets: {
    kneeFlexionRangeDeg?: NumericTargetRange;
    durationSeconds?: NumericTargetRange;
    trunkInclinationP95Deg?: NumericTargetRange;
    bilateralDifferenceDeg?: NumericTargetRange;
  };
  weights: {
    geometric: number;
    temporal: number;
    symmetry: number;
    smoothness: number;
    compensation: number;
    completeness: number;
  };
}

export interface SquatRepetitionObservation {
  repetitionId: string;
  valid: boolean;
  confidence: number;
  kneeFlexionRangeLeftDeg?: number;
  kneeFlexionRangeRightDeg?: number;
  durationSeconds?: number;
  trunkInclinationP95Deg?: number;
  bilateralDifferenceDeg?: number;
  smoothnessScore?: number;
  compensationScore?: number;
  perception?: MovementPerception;
}

export interface SquatRepetitionAssessmentV1 {
  repetitionId: string;
  quality: MovementQualityScore;
  calibration?: MovementCalibration;
}

export interface SquatAssessmentV1Result {
  protocolId: typeof SQUAT_ASSESSMENT_V1;
  repetitions: SquatRepetitionAssessmentV1[];
  overallQuality?: number;
  confidence: number;
  validRepetitions: number;
  totalRepetitions: number;
  status: "valid" | "partial" | "unavailable";
  reasons: string[];
}

function clamp100(value: number) {
  return Math.max(0, Math.min(100, value));
}

function scoreAgainstRange(value: number | undefined, range: NumericTargetRange | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || !range) return undefined;
  const tolerance = Math.max(0.0001, range.tolerance ?? Math.max(1, Math.abs(value) * 0.1));
  if ((range.min === undefined || value >= range.min) && (range.max === undefined || value <= range.max)) return 100;
  const distance = range.min !== undefined && value < range.min
    ? range.min - value
    : range.max !== undefined && value > range.max
      ? value - range.max
      : 0;
  return clamp100(100 * (1 - distance / tolerance));
}

function averageDefined(values: Array<number | undefined>): number | undefined {
  const finite = values.filter((value): value is number => value !== undefined && Number.isFinite(value));
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : undefined;
}

export function assessSquatRepetitionV1(
  observation: SquatRepetitionObservation,
  protocol: SquatAssessmentV1Protocol,
): SquatRepetitionAssessmentV1 {
  const kneeScore = averageDefined([
    scoreAgainstRange(observation.kneeFlexionRangeLeftDeg, protocol.targets.kneeFlexionRangeDeg),
    scoreAgainstRange(observation.kneeFlexionRangeRightDeg, protocol.targets.kneeFlexionRangeDeg),
  ]);
  const trunkScore = scoreAgainstRange(observation.trunkInclinationP95Deg, protocol.targets.trunkInclinationP95Deg);
  const geometricScore = averageDefined([kneeScore, trunkScore]);
  const dimensions: QualityDimensionInput[] = [
    { id: "geometric", score: geometricScore, confidence: observation.confidence, weight: protocol.weights.geometric },
    { id: "temporal", score: scoreAgainstRange(observation.durationSeconds, protocol.targets.durationSeconds), confidence: observation.confidence, weight: protocol.weights.temporal },
    { id: "symmetry", score: scoreAgainstRange(observation.bilateralDifferenceDeg, protocol.targets.bilateralDifferenceDeg), confidence: observation.confidence, weight: protocol.weights.symmetry },
    { id: "smoothness", score: observation.smoothnessScore, confidence: observation.confidence, weight: protocol.weights.smoothness },
    { id: "compensation", score: observation.compensationScore, confidence: observation.confidence, weight: protocol.weights.compensation },
    { id: "completeness", score: observation.valid ? 100 : 0, confidence: observation.confidence, weight: protocol.weights.completeness },
  ];

  const quality = calculateMovementQuality(dimensions, protocol.minimumConfidence);
  return {
    repetitionId: observation.repetitionId,
    quality,
    calibration: observation.perception
      ? calculateCalibrationGap(quality.overall, observation.perception)
      : undefined,
  };
}

export function assessSquatV1(
  observations: SquatRepetitionObservation[],
  protocol: SquatAssessmentV1Protocol,
): SquatAssessmentV1Result {
  const repetitions = observations.map((observation) => assessSquatRepetitionV1(observation, protocol));
  const scored = repetitions.filter((repetition) => repetition.quality.overall !== undefined);
  const validObservations = observations.filter((observation) => observation.valid);
  const overallQuality = scored.length
    ? scored.reduce((sum, repetition) => sum + repetition.quality.overall!, 0) / scored.length
    : undefined;
  const confidence = scored.length
    ? scored.reduce((sum, repetition) => sum + repetition.quality.confidence, 0) / scored.length
    : 0;
  const reasons: string[] = [];
  if (!observations.length) reasons.push("no_repetitions");
  if (scored.length < observations.length) reasons.push("partial_scoring");
  if (validObservations.length < observations.length) reasons.push("invalid_repetitions_present");

  return {
    protocolId: SQUAT_ASSESSMENT_V1,
    repetitions,
    overallQuality,
    confidence,
    validRepetitions: validObservations.length,
    totalRepetitions: observations.length,
    status: !scored.length ? "unavailable" : reasons.length ? "partial" : "valid",
    reasons,
  };
}
