export interface ProgressionSessionSummary {
  assessmentId: string;
  measuredQuality?: number;
  captureConfidence: number;
  pain?: number;
  perceivedDifficulty?: number;
  validRepetitions: number;
  totalRepetitions: number;
}

export interface ProgressionPolicy {
  minimumSessions: number;
  minimumQuality: number;
  minimumCaptureConfidence: number;
  maximumPainForProgression?: number;
  maximumPerceivedDifficultyForProgression?: number;
  minimumValidRepetitionRatio: number;
}

export interface ProgressionSuggestion {
  suggestion: "consider-progress" | "maintain" | "consider-regress" | "review-required";
  confidence: number;
  reasons: string[];
  requiresProfessionalReview: true;
}

export function suggestProgression(
  sessions: ProgressionSessionSummary[],
  policy: ProgressionPolicy,
): ProgressionSuggestion {
  const recent = sessions.slice(-policy.minimumSessions);
  const reasons: string[] = [];
  if (recent.length < policy.minimumSessions) {
    return {
      suggestion: "review-required",
      confidence: 0,
      reasons: ["insufficient_longitudinal_sessions"],
      requiresProfessionalReview: true,
    };
  }

  const qualityValues = recent
    .map((session) => session.measuredQuality)
    .filter((value): value is number => value !== undefined && Number.isFinite(value));
  if (qualityValues.length < recent.length) reasons.push("missing_quality_measurement");

  const meanQuality = qualityValues.length
    ? qualityValues.reduce((sum, value) => sum + value, 0) / qualityValues.length
    : 0;
  const meanConfidence = recent.reduce((sum, session) => sum + session.captureConfidence, 0) / recent.length;
  const validRatios = recent.map((session) => session.totalRepetitions > 0 ? session.validRepetitions / session.totalRepetitions : 0);
  const meanValidRatio = validRatios.reduce((sum, value) => sum + value, 0) / validRatios.length;
  const painValues = recent.map((session) => session.pain).filter((value): value is number => value !== undefined);
  const maxPain = painValues.length ? Math.max(...painValues) : undefined;
  const difficultyValues = recent.map((session) => session.perceivedDifficulty).filter((value): value is number => value !== undefined);
  const maxDifficulty = difficultyValues.length ? Math.max(...difficultyValues) : undefined;

  if (meanConfidence < policy.minimumCaptureConfidence) reasons.push("capture_confidence_below_threshold");
  if (meanValidRatio < policy.minimumValidRepetitionRatio) reasons.push("valid_repetition_ratio_below_threshold");
  if (meanQuality < policy.minimumQuality) reasons.push("quality_below_progression_threshold");
  if (policy.maximumPainForProgression !== undefined && maxPain !== undefined && maxPain > policy.maximumPainForProgression) reasons.push("pain_above_progression_threshold");
  if (policy.maximumPerceivedDifficultyForProgression !== undefined && maxDifficulty !== undefined && maxDifficulty > policy.maximumPerceivedDifficultyForProgression) reasons.push("difficulty_above_progression_threshold");

  const confidence = Math.max(0, Math.min(1, meanConfidence * meanValidRatio));
  if (reasons.some((reason) => reason.includes("pain_above") || reason.includes("quality_below"))) {
    return { suggestion: "consider-regress", confidence, reasons, requiresProfessionalReview: true };
  }
  if (reasons.length) {
    return { suggestion: "maintain", confidence, reasons, requiresProfessionalReview: true };
  }
  return {
    suggestion: "consider-progress",
    confidence,
    reasons: ["stable_quality_across_required_sessions"],
    requiresProfessionalReview: true,
  };
}
