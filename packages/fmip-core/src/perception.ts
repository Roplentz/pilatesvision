export interface MovementPerception {
  repetitionId?: string;
  perceivedQuality?: number;
  confidence: number;
  perceivedDifficulty?: number;
  pain?: number;
  capturedAt?: string;
}

export type CalibrationStatus = "aligned" | "underconfident" | "overconfident" | "insufficient-data";

export interface MovementCalibration {
  measuredQuality?: number;
  perceivedQuality?: number;
  confidence: number;
  gap?: number;
  status: CalibrationStatus;
  reasons: string[];
}

const clamp100 = (value: number) => Math.max(0, Math.min(100, value));
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function calculateCalibrationGap(
  measuredQuality: number | undefined,
  perception: MovementPerception,
  alignedTolerance = 10,
): MovementCalibration {
  const reasons: string[] = [];
  const confidence = clamp01(perception.confidence);

  if (measuredQuality === undefined || perception.perceivedQuality === undefined) {
    reasons.push("missing_quality_pair");
    return {
      measuredQuality,
      perceivedQuality: perception.perceivedQuality,
      confidence,
      status: "insufficient-data",
      reasons,
    };
  }

  const measured = clamp100(measuredQuality);
  const perceived = clamp100(perception.perceivedQuality);
  const gap = perceived - measured;

  return {
    measuredQuality: measured,
    perceivedQuality: perceived,
    confidence,
    gap,
    status: Math.abs(gap) <= alignedTolerance ? "aligned" : gap < 0 ? "underconfident" : "overconfident",
    reasons,
  };
}
