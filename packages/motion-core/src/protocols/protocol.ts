import type { MotionEvent, MotionMetric, MotionQuality, MotionSeries } from "../schema";

export type CapturePlane = "sagittal" | "frontal" | "transverse" | "multiplanar";

export interface ProtocolCaptureRequirements {
  allowedPlanes: CapturePlane[];
  minimumDurationSeconds?: number;
  minimumSamplingRateHz?: number;
  minimumValidFrameRatio?: number;
  maximumPeople?: number;
  requiredLandmarks?: string[];
}

export interface ProtocolContext {
  protocolId: string;
  protocolVersion: string;
  exercise: string;
  captureRequirements: ProtocolCaptureRequirements;
}

export interface ProtocolResult {
  protocolId: string;
  protocolVersion: string;
  exercise: string;
  quality?: MotionQuality;
  events: MotionEvent[];
  metrics: MotionMetric[];
  warnings: string[];
  clinicallyInterpretable: boolean;
}

export interface MotionProtocol {
  readonly context: ProtocolContext;
  analyze(series: MotionSeries): ProtocolResult;
}

export function validateProtocolContext(context: ProtocolContext): void {
  if (!context.protocolId.trim()) throw new Error("protocol_id_required");
  if (!context.protocolVersion.trim()) throw new Error("protocol_version_required");
  if (!context.exercise.trim()) throw new Error("protocol_exercise_required");
  if (!context.captureRequirements.allowedPlanes.length) {
    throw new Error("protocol_capture_plane_required");
  }

  const ratio = context.captureRequirements.minimumValidFrameRatio;
  if (ratio !== undefined && (!Number.isFinite(ratio) || ratio < 0 || ratio > 1)) {
    throw new Error("protocol_valid_frame_ratio_invalid");
  }
}
