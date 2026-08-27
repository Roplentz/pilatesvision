export const FH_MOTION_SCHEMA_VERSION = "1.0.0" as const;

export type CoordinateSystem = "image" | "normalized" | "world";
export type MotionQualityLevel = "excellent" | "good" | "acceptable" | "poor" | "invalid";

export interface MotionLandmark {
  name: string;
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  confidence?: number;
}

export interface MotionFrame {
  frameNumber: number;
  timestampSeconds: number;
  landmarks: MotionLandmark[];
  meanConfidence?: number;
  quality?: MotionQualityLevel;
}

export interface MotionEvent {
  id: string;
  type: string;
  frameNumber: number;
  timestampSeconds: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface MotionMetric {
  name: string;
  value: number;
  unit: string;
  method: string;
  confidence?: number;
  source?: string;
}

export interface MotionQuality {
  level: MotionQualityLevel;
  score: number;
  meanVisibility?: number;
  trackingLossRatio?: number;
  bodyCoverage?: number;
  reasons: string[];
}

export interface MotionSeries {
  samplingRateHz: number;
  durationSeconds: number;
  coordinateSystem: CoordinateSystem;
  frames: MotionFrame[];
  events?: MotionEvent[];
  metrics?: MotionMetric[];
  quality?: MotionQuality;
}

export interface MotionAssessment {
  assessmentId: string;
  patientId?: string;
  protocol: string;
  exercise: string;
  capturedAt: string;
  schemaVersion: typeof FH_MOTION_SCHEMA_VERSION;
  poseEngine: {
    name: string;
    version: string;
  };
  series: MotionSeries;
  versions?: {
    biomechanics?: string;
    clinicalEngine?: string;
    report?: string;
  };
}
