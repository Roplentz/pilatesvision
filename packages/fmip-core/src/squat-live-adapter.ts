import {
  analyzeSquatSeries,
  mediaPipeSeriesToMotionSeries,
  type MediaPipeSeriesInput,
  type MotionFrame,
  type MotionLandmark,
  type MotionSeries,
  type SquatAnalysisResult,
} from "../../motion-core/src";
import {
  assessCaptureReadiness,
  type CaptureReadinessInput,
  type CaptureReadinessProtocol,
  type CaptureReadinessResult,
} from "./capture-readiness";
import {
  assessSquatV1,
  type SquatAssessmentV1Protocol,
  type SquatAssessmentV1Result,
  type SquatRepetitionObservation,
} from "./squat-assessment-v1";
import {
  initialSquatState,
  nextSquatState,
  type SquatState,
  type SquatStateMachineConfig,
} from "./squat-state-machine";
import type { MovementPerception } from "./perception";

const SQUAT_CRITICAL_LANDMARKS = [
  "LEFT_SHOULDER",
  "RIGHT_SHOULDER",
  "LEFT_HIP",
  "RIGHT_HIP",
  "LEFT_KNEE",
  "RIGHT_KNEE",
  "LEFT_ANKLE",
  "RIGHT_ANKLE",
] as const;

export interface SquatLiveCaptureMetadata {
  lightingScore?: number;
  blurScore?: number;
  cameraPitchDegrees?: number;
  personCount?: number;
}

export interface SquatLiveAdapterInput {
  mediaPipe: MediaPipeSeriesInput;
  readinessProtocol: CaptureReadinessProtocol;
  assessmentProtocol: SquatAssessmentV1Protocol;
  stateMachineConfig: SquatStateMachineConfig;
  capture?: SquatLiveCaptureMetadata;
  perceptionByRepetitionId?: Record<string, MovementPerception>;
}

export interface SquatStateTraceEntry {
  timestampSeconds: number;
  state: SquatState;
  repetitionCount: number;
  kneeFlexionDeg: number;
  angularVelocityDegPerSecond: number;
  confidence: number;
}

export interface SquatLiveAdapterResult {
  status: "blocked" | "analyzed";
  readiness: CaptureReadinessResult;
  motionSeries: MotionSeries;
  analysis?: SquatAnalysisResult;
  stateTrace: SquatStateTraceEntry[];
  stateMachineRepetitions: number;
  assessment?: SquatAssessmentV1Result;
  warnings: string[];
}

function landmarkByName(frame: MotionFrame, name: string): MotionLandmark | undefined {
  return frame.landmarks.find((landmark) => landmark.name === name);
}

function finiteMean(values: number[]): number {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function criticalLandmarks(frame: MotionFrame): MotionLandmark[] {
  return SQUAT_CRITICAL_LANDMARKS.map((name) => landmarkByName(frame, name)).filter(
    (landmark): landmark is MotionLandmark => landmark !== undefined,
  );
}

function deriveReadinessInput(
  series: MotionSeries,
  capture: SquatLiveCaptureMetadata = {},
): CaptureReadinessInput {
  const critical = series.frames.flatMap(criticalLandmarks);
  const expected = series.frames.length * SQUAT_CRITICAL_LANDMARKS.length;
  const inFrame = critical.filter(
    (landmark) => landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1,
  ).length;
  const visible = critical
    .map((landmark) => landmark.visibility ?? landmark.confidence)
    .filter((value): value is number => value !== undefined && Number.isFinite(value));

  return {
    bodyCoverage: expected > 0 ? inFrame / expected : 0,
    landmarkVisibility: finiteMean(visible),
    lightingScore: capture.lightingScore,
    blurScore: capture.blurScore,
    cameraPitchDegrees: capture.cameraPitchDegrees,
    personCount: capture.personCount,
    durationSeconds: series.durationSeconds,
  };
}

function kneeFlexionDeg(frame: MotionFrame): number | undefined {
  const leftHip = landmarkByName(frame, "LEFT_HIP");
  const leftKnee = landmarkByName(frame, "LEFT_KNEE");
  const leftAnkle = landmarkByName(frame, "LEFT_ANKLE");
  const rightHip = landmarkByName(frame, "RIGHT_HIP");
  const rightKnee = landmarkByName(frame, "RIGHT_KNEE");
  const rightAnkle = landmarkByName(frame, "RIGHT_ANKLE");

  if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
    return undefined;
  }

  const angle = (a: MotionLandmark, b: MotionLandmark, c: MotionLandmark): number => {
    const abx = a.x - b.x;
    const aby = a.y - b.y;
    const cbx = c.x - b.x;
    const cby = c.y - b.y;
    const denominator = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
    if (denominator <= 1e-9) return Number.NaN;
    const cosine = Math.max(-1, Math.min(1, (abx * cbx + aby * cby) / denominator));
    return (Math.acos(cosine) * 180) / Math.PI;
  };

  const leftFlexion = 180 - angle(leftHip, leftKnee, leftAnkle);
  const rightFlexion = 180 - angle(rightHip, rightKnee, rightAnkle);
  const value = finiteMean([leftFlexion, rightFlexion]);
  return Number.isFinite(value) ? value : undefined;
}

export function buildSquatStateTrace(
  series: MotionSeries,
  config: SquatStateMachineConfig,
): SquatStateTraceEntry[] {
  let snapshot = initialSquatState();
  let previousFlexion: number | undefined;
  let previousTimestamp: number | undefined;
  const trace: SquatStateTraceEntry[] = [];

  for (const frame of series.frames) {
    const flexion = kneeFlexionDeg(frame);
    if (flexion === undefined) continue;

    const dt =
      previousTimestamp === undefined ? 0 : Math.max(0, frame.timestampSeconds - previousTimestamp);
    const velocity =
      previousFlexion === undefined || dt <= 0 ? 0 : (flexion - previousFlexion) / dt;
    const confidence = frame.meanConfidence ?? 0;

    snapshot = nextSquatState(
      snapshot,
      {
        timestampSeconds: frame.timestampSeconds,
        kneeFlexionDeg: flexion,
        angularVelocityDegPerSecond: velocity,
        confidence,
      },
      config,
    );

    trace.push({
      timestampSeconds: frame.timestampSeconds,
      state: snapshot.state,
      repetitionCount: snapshot.repetitionCount,
      kneeFlexionDeg: flexion,
      angularVelocityDegPerSecond: velocity,
      confidence,
    });

    previousFlexion = flexion;
    previousTimestamp = frame.timestampSeconds;
  }

  return trace;
}

function observationsFromAnalysis(
  analysis: SquatAnalysisResult,
  perceptionByRepetitionId: Record<string, MovementPerception> = {},
): SquatRepetitionObservation[] {
  return analysis.repetitions.map((repetition) => {
    const repetitionId = `rep-${repetition.repetition}`;
    return {
      repetitionId,
      valid: repetition.valid,
      confidence: repetition.confidence,
      kneeFlexionRangeLeftDeg: repetition.leftKneeFlexionRangeDeg,
      kneeFlexionRangeRightDeg: repetition.rightKneeFlexionRangeDeg,
      durationSeconds: repetition.durationSeconds,
      trunkInclinationP95Deg: repetition.trunkInclinationP95Deg,
      bilateralDifferenceDeg: Math.abs(
        repetition.leftKneeFlexionRangeDeg - repetition.rightKneeFlexionRangeDeg,
      ),
      perception: perceptionByRepetitionId[repetitionId],
    };
  });
}

export function runExperimentalSquatLiveAdapter(
  input: SquatLiveAdapterInput,
): SquatLiveAdapterResult {
  const motionSeries = mediaPipeSeriesToMotionSeries(input.mediaPipe);
  const readiness = assessCaptureReadiness(
    deriveReadinessInput(motionSeries, input.capture),
    input.readinessProtocol,
  );
  const stateTrace = buildSquatStateTrace(motionSeries, input.stateMachineConfig);
  const stateMachineRepetitions = stateTrace.at(-1)?.repetitionCount ?? 0;

  if (readiness.status === "blocked") {
    return {
      status: "blocked",
      readiness,
      motionSeries,
      stateTrace,
      stateMachineRepetitions,
      warnings: [...readiness.blockingReasons, ...readiness.warnings],
    };
  }

  const analysis = analyzeSquatSeries(motionSeries);
  const observations = observationsFromAnalysis(
    analysis,
    input.perceptionByRepetitionId,
  );
  const assessment = assessSquatV1(observations, input.assessmentProtocol);
  const warnings = [...readiness.warnings];

  if (analysis.repetitionsDetected !== stateMachineRepetitions) {
    warnings.push("repetition_detectors_disagree");
  }

  return {
    status: "analyzed",
    readiness,
    motionSeries,
    analysis,
    stateTrace,
    stateMachineRepetitions,
    assessment,
    warnings,
  };
}
