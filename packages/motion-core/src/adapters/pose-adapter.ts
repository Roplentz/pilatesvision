import type { CoordinateSystem, MotionSeries } from "../schema";

export type PoseInputKind = "video" | "image" | "live-stream" | "landmark-series";

export interface PoseInput {
  kind: PoseInputKind;
  sourceId?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  frames?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface PoseModelMetadata {
  engine: string;
  model: string;
  version: string;
  coordinateSystem: CoordinateSystem;
  landmarkSet: string;
  landmarkCount: number;
  runsOnDevice: boolean;
  supportsMultiplePeople: boolean;
  license?: string;
}

export interface PoseProcessingOptions {
  maximumPeople?: number;
  minimumConfidence?: number;
  targetSamplingRateHz?: number;
  signal?: AbortSignal;
}

export interface PoseAdapter {
  readonly id: string;
  getModelMetadata(): PoseModelMetadata;
  process(input: PoseInput, options?: PoseProcessingOptions): Promise<MotionSeries>;
}

export function assertPoseAdapterMetadata(metadata: PoseModelMetadata): void {
  if (!metadata.engine.trim()) throw new Error("pose_adapter_engine_required");
  if (!metadata.model.trim()) throw new Error("pose_adapter_model_required");
  if (!metadata.version.trim()) throw new Error("pose_adapter_version_required");
  if (!metadata.landmarkSet.trim()) throw new Error("pose_adapter_landmark_set_required");
  if (!Number.isInteger(metadata.landmarkCount) || metadata.landmarkCount <= 0) {
    throw new Error("pose_adapter_landmark_count_invalid");
  }
}
