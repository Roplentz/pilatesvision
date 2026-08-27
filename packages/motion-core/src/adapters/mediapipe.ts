import type { MotionFrame, MotionLandmark, MotionSeries } from "../schema";

export const MEDIAPIPE_POSE_LANDMARK_NAMES = [
  "NOSE",
  "LEFT_EYE_INNER",
  "LEFT_EYE",
  "LEFT_EYE_OUTER",
  "RIGHT_EYE_INNER",
  "RIGHT_EYE",
  "RIGHT_EYE_OUTER",
  "LEFT_EAR",
  "RIGHT_EAR",
  "MOUTH_LEFT",
  "MOUTH_RIGHT",
  "LEFT_SHOULDER",
  "RIGHT_SHOULDER",
  "LEFT_ELBOW",
  "RIGHT_ELBOW",
  "LEFT_WRIST",
  "RIGHT_WRIST",
  "LEFT_PINKY",
  "RIGHT_PINKY",
  "LEFT_INDEX",
  "RIGHT_INDEX",
  "LEFT_THUMB",
  "RIGHT_THUMB",
  "LEFT_HIP",
  "RIGHT_HIP",
  "LEFT_KNEE",
  "RIGHT_KNEE",
  "LEFT_ANKLE",
  "RIGHT_ANKLE",
  "LEFT_HEEL",
  "RIGHT_HEEL",
  "LEFT_FOOT_INDEX",
  "RIGHT_FOOT_INDEX",
] as const;

export interface MediaPipeLandmarkLike {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export interface MediaPipeFrameInput {
  frameNumber: number;
  timestampSeconds: number;
  landmarks: MediaPipeLandmarkLike[];
}

export interface MediaPipeSeriesInput {
  samplingRateHz: number;
  frames: MediaPipeFrameInput[];
}

export interface MediaPipeAdapterOptions {
  minimumVisibility?: number;
  rejectUnexpectedLandmarkCount?: boolean;
}

const DEFAULT_OPTIONS: Required<MediaPipeAdapterOptions> = {
  minimumVisibility: 0,
  rejectUnexpectedLandmarkCount: true,
};

function finiteOrUndefined(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) ? value : undefined;
}

function assertFiniteCoordinate(value: number, field: string, index: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`MediaPipe landmark ${index} has invalid ${field} coordinate.`);
  }
}

export function mediaPipeLandmarkToMotionLandmark(
  landmark: MediaPipeLandmarkLike,
  index: number,
): MotionLandmark {
  const name = MEDIAPIPE_POSE_LANDMARK_NAMES[index];
  if (!name) throw new Error(`Unsupported MediaPipe landmark index: ${index}.`);

  assertFiniteCoordinate(landmark.x, "x", index);
  assertFiniteCoordinate(landmark.y, "y", index);

  const visibility = finiteOrUndefined(landmark.visibility);
  const presence = finiteOrUndefined(landmark.presence);

  return {
    name,
    x: landmark.x,
    y: landmark.y,
    z: finiteOrUndefined(landmark.z),
    visibility,
    confidence: presence ?? visibility,
  };
}

export function mediaPipeFrameToMotionFrame(
  input: MediaPipeFrameInput,
  options: MediaPipeAdapterOptions = {},
): MotionFrame {
  const config = { ...DEFAULT_OPTIONS, ...options };

  if (!Number.isInteger(input.frameNumber) || input.frameNumber < 0) {
    throw new Error("frameNumber must be a non-negative integer.");
  }
  if (!Number.isFinite(input.timestampSeconds) || input.timestampSeconds < 0) {
    throw new Error("timestampSeconds must be a non-negative finite number.");
  }
  if (
    config.rejectUnexpectedLandmarkCount &&
    input.landmarks.length !== MEDIAPIPE_POSE_LANDMARK_NAMES.length
  ) {
    throw new Error(
      `Expected ${MEDIAPIPE_POSE_LANDMARK_NAMES.length} MediaPipe landmarks, received ${input.landmarks.length}.`,
    );
  }

  const landmarks = input.landmarks.map(mediaPipeLandmarkToMotionLandmark);
  const visible = landmarks
    .map((landmark) => landmark.visibility)
    .filter((value): value is number => value !== undefined && value >= config.minimumVisibility);
  const meanConfidence =
    visible.length > 0 ? visible.reduce((sum, value) => sum + value, 0) / visible.length : undefined;

  return {
    frameNumber: input.frameNumber,
    timestampSeconds: input.timestampSeconds,
    landmarks,
    meanConfidence,
  };
}

export function mediaPipeSeriesToMotionSeries(
  input: MediaPipeSeriesInput,
  options: MediaPipeAdapterOptions = {},
): MotionSeries {
  if (!Number.isFinite(input.samplingRateHz) || input.samplingRateHz <= 0) {
    throw new Error("samplingRateHz must be greater than zero.");
  }

  const frames = input.frames.map((frame) => mediaPipeFrameToMotionFrame(frame, options));
  for (let index = 1; index < frames.length; index += 1) {
    if (frames[index].timestampSeconds < frames[index - 1].timestampSeconds) {
      throw new Error("Frame timestamps must be ordered chronologically.");
    }
  }

  const durationSeconds = frames.length > 0 ? frames[frames.length - 1].timestampSeconds : 0;

  return {
    samplingRateHz: input.samplingRateHz,
    durationSeconds,
    coordinateSystem: "normalized",
    frames,
  };
}
