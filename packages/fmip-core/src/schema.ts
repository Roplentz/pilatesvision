export const FMIP_SCHEMA_VERSION = "0.1.0" as const;

export type AssessmentDomain =
  | "pilates"
  | "posture"
  | "gait"
  | "balance"
  | "orthopedics"
  | "neurology"
  | "sports"
  | "hospital";

export type PipelineStage =
  | "capture"
  | "quality"
  | "pose"
  | "motion"
  | "events"
  | "biomechanics"
  | "protocol"
  | "clinical-review"
  | "report";

export type ModuleStatus = "experimental" | "validated" | "deprecated";

export interface EngineVersion {
  name: string;
  version: string;
  build?: string;
}

export interface AssessmentContext {
  assessmentId: string;
  clinicId: string;
  patientId?: string;
  encounterId?: string;
  protocolId: string;
  protocolVersion: string;
  capturedAt: string;
  consentId?: string;
}

export interface StageProvenance {
  stage: PipelineStage;
  startedAt: string;
  completedAt: string;
  engine: EngineVersion;
  inputVersion?: string;
  outputVersion?: string;
  warnings: string[];
}

export interface AssessmentEnvelope<TPayload = unknown> {
  schemaVersion: typeof FMIP_SCHEMA_VERSION;
  domain: AssessmentDomain;
  context: AssessmentContext;
  payload: TPayload;
  provenance: StageProvenance[];
  warnings: string[];
}

export interface AssessmentModule<TInput = unknown, TOutput = unknown> {
  id: string;
  version: string;
  domain: AssessmentDomain;
  stage: PipelineStage;
  status: ModuleStatus;
  run(input: TInput, context: AssessmentContext): Promise<TOutput> | TOutput;
}
