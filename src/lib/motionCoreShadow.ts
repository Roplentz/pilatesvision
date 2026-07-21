// ---------------------------------------------------------------------------
// FisioHub Motion Core · MODO SOMBRA
//
// Executa o novo motion core em paralelo ao motor legado sem interferir no
// resultado oficial persistido. Serializável para anexo em JSON não
// destrutivo (`fisiohub_motion_core_shadow`).
// ---------------------------------------------------------------------------

import {
  MOTION_CORE_ENGINE,
  MOTION_CORE_VERSION,
  analyzeSquatSeries,
  mediapipeAdapter,
  type RawFrame,
  type SquatAnalysis,
} from "@/lib/fisiohub-motion-core";
import type { AutoMetricsSummary } from "@/lib/poseMetrics";

export const MOTION_CORE_SHADOW_FLAG = "VITE_FISIOHUB_MOTION_CORE_SHADOW";

export interface MotionCoreShadowComparison {
  legacyRepsTotal: number | null;
  legacyRepsValid: number | null;
  shadowRepsTotal: number;
  shadowRepsValid: number;
  repsTotalDelta: number | null;
  repsValidDelta: number | null;
}

export interface MotionCoreShadowSuccess {
  status: "ok";
  engine: typeof MOTION_CORE_ENGINE;
  engineVersion: typeof MOTION_CORE_VERSION;
  enabled: true;
  framesAnalyzed: number;
  framesValid: number;
  validFrameRatio: number;
  repetitionsDetected: number;
  repetitionsValid: number;
  events: SquatAnalysis["events"];
  metrics: SquatAnalysis["metrics"];
  comparison: MotionCoreShadowComparison;
}

export interface MotionCoreShadowDisabled {
  status: "disabled";
  engine: typeof MOTION_CORE_ENGINE;
  engineVersion: typeof MOTION_CORE_VERSION;
  enabled: false;
}

export interface MotionCoreShadowError {
  status: "error";
  engine: typeof MOTION_CORE_ENGINE;
  engineVersion: typeof MOTION_CORE_VERSION;
  enabled: true;
  message: string;
}

export type MotionCoreShadowResult =
  | MotionCoreShadowSuccess
  | MotionCoreShadowDisabled
  | MotionCoreShadowError;

export function isMotionCoreShadowEnabled(): boolean {
  try {
    return (
      typeof import.meta !== "undefined" &&
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[
        MOTION_CORE_SHADOW_FLAG
      ] === "true"
    );
  } catch {
    return false;
  }
}

function disabled(): MotionCoreShadowDisabled {
  return {
    status: "disabled",
    engine: MOTION_CORE_ENGINE,
    engineVersion: MOTION_CORE_VERSION,
    enabled: false,
  };
}

function errored(message: string): MotionCoreShadowError {
  return {
    status: "error",
    engine: MOTION_CORE_ENGINE,
    engineVersion: MOTION_CORE_VERSION,
    enabled: true,
    message: message.slice(0, 240),
  };
}

export interface RunMotionCoreShadowOptions {
  /** Força o comportamento da flag — útil em testes. */
  forceEnabled?: boolean;
}

/**
 * Executa o motion core em modo sombra. NUNCA lança: falhas são reportadas
 * via `status: "error"` para preservar o fluxo principal.
 */
export function runMotionCoreShadow(
  frames: RawFrame[],
  legacySummary?: AutoMetricsSummary | null,
  options: RunMotionCoreShadowOptions = {},
): MotionCoreShadowResult {
  const enabled = options.forceEnabled ?? isMotionCoreShadowEnabled();
  if (!enabled) return disabled();
  try {
    const series = mediapipeAdapter(Array.isArray(frames) ? frames : []);
    const analysis = analyzeSquatSeries(series);
    const legacyTotal =
      legacySummary && Number.isFinite(legacySummary.reps_total) ? legacySummary.reps_total : null;
    const legacyValid =
      legacySummary && Number.isFinite(legacySummary.reps_valid) ? legacySummary.reps_valid : null;
    const comparison: MotionCoreShadowComparison = {
      legacyRepsTotal: legacyTotal,
      legacyRepsValid: legacyValid,
      shadowRepsTotal: analysis.repetitionsDetected,
      shadowRepsValid: analysis.repetitionsValid,
      repsTotalDelta: legacyTotal === null ? null : analysis.repetitionsDetected - legacyTotal,
      repsValidDelta: legacyValid === null ? null : analysis.repetitionsValid - legacyValid,
    };
    return {
      status: "ok",
      engine: MOTION_CORE_ENGINE,
      engineVersion: MOTION_CORE_VERSION,
      enabled: true,
      framesAnalyzed: analysis.framesAnalyzed,
      framesValid: analysis.framesValid,
      validFrameRatio: analysis.validFrameRatio,
      repetitionsDetected: analysis.repetitionsDetected,
      repetitionsValid: analysis.repetitionsValid,
      events: analysis.events,
      metrics: analysis.metrics,
      comparison,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errored(msg);
  }
}
