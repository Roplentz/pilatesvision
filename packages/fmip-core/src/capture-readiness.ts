export type ReadinessStatus = "ready" | "attention" | "blocked";

export interface CaptureReadinessInput {
  bodyCoverage: number;
  landmarkVisibility: number;
  lightingScore?: number;
  blurScore?: number;
  cameraPitchDegrees?: number;
  personCount?: number;
  durationSeconds?: number;
}

export interface CaptureReadinessProtocol {
  minimumBodyCoverage: number;
  minimumLandmarkVisibility: number;
  minimumLightingScore?: number;
  minimumBlurScore?: number;
  maximumAbsoluteCameraPitchDegrees?: number;
  requiredPersonCount?: number;
  minimumDurationSeconds?: number;
}

export interface CaptureReadinessCheck {
  id: string;
  passed: boolean;
  severity: "attention" | "blocking";
  observed?: number;
  required?: number | string;
  message: string;
}

export interface CaptureReadinessResult {
  status: ReadinessStatus;
  score: number;
  checks: CaptureReadinessCheck[];
  blockingReasons: string[];
  warnings: string[];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function assessCaptureReadiness(
  input: CaptureReadinessInput,
  protocol: CaptureReadinessProtocol,
): CaptureReadinessResult {
  const checks: CaptureReadinessCheck[] = [];

  const addCheck = (check: CaptureReadinessCheck) => checks.push(check);

  addCheck({
    id: "body-coverage",
    passed: input.bodyCoverage >= protocol.minimumBodyCoverage,
    severity: "blocking",
    observed: input.bodyCoverage,
    required: protocol.minimumBodyCoverage,
    message: "Body coverage is below the protocol requirement.",
  });

  addCheck({
    id: "landmark-visibility",
    passed: input.landmarkVisibility >= protocol.minimumLandmarkVisibility,
    severity: "blocking",
    observed: input.landmarkVisibility,
    required: protocol.minimumLandmarkVisibility,
    message: "Critical landmarks are not sufficiently visible.",
  });

  if (protocol.minimumLightingScore !== undefined && input.lightingScore !== undefined) {
    addCheck({
      id: "lighting",
      passed: input.lightingScore >= protocol.minimumLightingScore,
      severity: "attention",
      observed: input.lightingScore,
      required: protocol.minimumLightingScore,
      message: "Lighting quality is below the preferred threshold.",
    });
  }

  if (protocol.minimumBlurScore !== undefined && input.blurScore !== undefined) {
    addCheck({
      id: "blur",
      passed: input.blurScore >= protocol.minimumBlurScore,
      severity: "attention",
      observed: input.blurScore,
      required: protocol.minimumBlurScore,
      message: "Image sharpness is below the preferred threshold.",
    });
  }

  if (
    protocol.maximumAbsoluteCameraPitchDegrees !== undefined &&
    input.cameraPitchDegrees !== undefined
  ) {
    addCheck({
      id: "camera-pitch",
      passed: Math.abs(input.cameraPitchDegrees) <= protocol.maximumAbsoluteCameraPitchDegrees,
      severity: "blocking",
      observed: Math.abs(input.cameraPitchDegrees),
      required: protocol.maximumAbsoluteCameraPitchDegrees,
      message: "Camera inclination is outside the protocol tolerance.",
    });
  }

  if (protocol.requiredPersonCount !== undefined && input.personCount !== undefined) {
    addCheck({
      id: "person-count",
      passed: input.personCount === protocol.requiredPersonCount,
      severity: "blocking",
      observed: input.personCount,
      required: String(protocol.requiredPersonCount),
      message: "Unexpected number of people detected in the capture.",
    });
  }

  if (protocol.minimumDurationSeconds !== undefined && input.durationSeconds !== undefined) {
    addCheck({
      id: "duration",
      passed: input.durationSeconds >= protocol.minimumDurationSeconds,
      severity: "attention",
      observed: input.durationSeconds,
      required: protocol.minimumDurationSeconds,
      message: "Capture duration is shorter than recommended.",
    });
  }

  const blockingReasons = checks
    .filter((check) => !check.passed && check.severity === "blocking")
    .map((check) => check.id);
  const warnings = checks
    .filter((check) => !check.passed && check.severity === "attention")
    .map((check) => check.id);

  const passedRatio =
    checks.length === 0 ? 1 : checks.filter((check) => check.passed).length / checks.length;
  const score = Math.round(clamp01(passedRatio) * 100);

  return {
    status: blockingReasons.length > 0 ? "blocked" : warnings.length > 0 ? "attention" : "ready",
    score,
    checks,
    blockingReasons,
    warnings,
  };
}
