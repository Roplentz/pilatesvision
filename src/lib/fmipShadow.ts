import {
  analyzeSquatSeries,
  mediaPipeSeriesToMotionSeries,
  type MediaPipeLandmarkLike,
} from "../../packages/motion-core/src";
import type { AutoMetricsSummary } from "./poseMetrics";

export interface FmipShadowFrame {
  frameNumber: number;
  timestampSeconds: number;
  landmarks: MediaPipeLandmarkLike[];
}

export interface FmipShadowTolerance {
  durationSeconds: number;
  angleDegrees: number;
  confidence: number;
}

export interface FmipShadowRepDelta {
  repetition: number;
  durationSeconds: number;
  leftKneeRangeDegrees: number;
  rightKneeRangeDegrees: number;
  confidence: number;
}

export interface FmipShadowReport {
  mode: "fmip-shadow";
  status: "equivalent" | "divergent" | "unavailable";
  legacy: {
    repetitionsDetected: number;
    validRepetitions: number;
  };
  fmip: {
    repetitionsDetected: number;
    validRepetitions: number;
    validFrameRatio: number;
  };
  deltas: {
    repetitionsDetected: number;
    validRepetitions: number;
    matchedRepetitions: FmipShadowRepDelta[];
  };
  reasons: string[];
}

export const DEFAULT_FMIP_SHADOW_TOLERANCE: FmipShadowTolerance = {
  durationSeconds: 0.05,
  angleDegrees: 0.5,
  confidence: 0.02,
};

export function isFmipShadowEnabled(): boolean {
  return import.meta.env.VITE_FMIP_SHADOW_ENABLED === "true";
}

function absDelta(a: number, b: number): number {
  return Math.abs(a - b);
}

export function compareLegacyWithFmipShadow(
  frames: FmipShadowFrame[],
  samplingRateHz: number,
  legacy: AutoMetricsSummary,
  tolerance: FmipShadowTolerance = DEFAULT_FMIP_SHADOW_TOLERANCE,
): FmipShadowReport {
  if (!frames.length || samplingRateHz <= 0 || legacy.context !== "squat") {
    return {
      mode: "fmip-shadow",
      status: "unavailable",
      legacy: {
        repetitionsDetected: legacy.reps_total,
        validRepetitions: legacy.reps_valid,
      },
      fmip: { repetitionsDetected: 0, validRepetitions: 0, validFrameRatio: 0 },
      deltas: {
        repetitionsDetected: -legacy.reps_total,
        validRepetitions: -legacy.reps_valid,
        matchedRepetitions: [],
      },
      reasons: [legacy.context !== "squat" ? "unsupported_context" : "insufficient_shadow_input"],
    };
  }

  const series = mediaPipeSeriesToMotionSeries({ samplingRateHz, frames });
  const fmip = analyzeSquatSeries(series);
  const matchedCount = Math.min(legacy.reps.length, fmip.repetitions.length);
  const matchedRepetitions: FmipShadowRepDelta[] = [];
  const reasons: string[] = [];

  for (let index = 0; index < matchedCount; index += 1) {
    const legacyRep = legacy.reps[index];
    const fmipRep = fmip.repetitions[index];
    const delta: FmipShadowRepDelta = {
      repetition: index + 1,
      durationSeconds: absDelta(legacyRep.duration_s, fmipRep.durationSeconds),
      leftKneeRangeDegrees: absDelta(
        legacyRep.knee_flexion_range_left_deg,
        fmipRep.leftKneeFlexionRangeDeg,
      ),
      rightKneeRangeDegrees: absDelta(
        legacyRep.knee_flexion_range_right_deg,
        fmipRep.rightKneeFlexionRangeDeg,
      ),
      confidence: absDelta(legacyRep.confidence, fmipRep.confidence),
    };
    matchedRepetitions.push(delta);

    if (delta.durationSeconds > tolerance.durationSeconds)
      reasons.push(`rep_${index + 1}_duration_delta`);
    if (delta.leftKneeRangeDegrees > tolerance.angleDegrees)
      reasons.push(`rep_${index + 1}_left_knee_delta`);
    if (delta.rightKneeRangeDegrees > tolerance.angleDegrees)
      reasons.push(`rep_${index + 1}_right_knee_delta`);
    if (delta.confidence > tolerance.confidence) reasons.push(`rep_${index + 1}_confidence_delta`);
  }

  const repetitionDelta = fmip.repetitionsDetected - legacy.reps_total;
  const validRepetitionDelta = fmip.validRepetitions - legacy.reps_valid;
  if (repetitionDelta !== 0) reasons.push("repetition_count_delta");
  if (validRepetitionDelta !== 0) reasons.push("valid_repetition_count_delta");

  return {
    mode: "fmip-shadow",
    status: reasons.length ? "divergent" : "equivalent",
    legacy: {
      repetitionsDetected: legacy.reps_total,
      validRepetitions: legacy.reps_valid,
    },
    fmip: {
      repetitionsDetected: fmip.repetitionsDetected,
      validRepetitions: fmip.validRepetitions,
      validFrameRatio: fmip.validFrameRatio,
    },
    deltas: {
      repetitionsDetected: repetitionDelta,
      validRepetitions: validRepetitionDelta,
      matchedRepetitions,
    },
    reasons,
  };
}

export function emitFmipShadowReport(report: FmipShadowReport): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FmipShadowReport>("fmip:shadow-report", { detail: report }));
  console.debug("[FMIP shadow]", report);
}
