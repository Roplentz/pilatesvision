import type {
  AssessmentContext,
  AssessmentEnvelope,
  AssessmentModule,
  PipelineStage,
  StageProvenance,
} from "./schema";

export interface PipelineStep {
  stage: PipelineStage;
  module: AssessmentModule;
  required: boolean;
}

export interface PipelineRunOptions {
  stopOnOptionalFailure?: boolean;
  now?: () => Date;
}

export async function runAssessmentPipeline(
  initial: AssessmentEnvelope,
  steps: PipelineStep[],
  options: PipelineRunOptions = {},
): Promise<AssessmentEnvelope> {
  const now = options.now ?? (() => new Date());
  let payload: unknown = initial.payload;
  const provenance: StageProvenance[] = [...initial.provenance];
  const warnings = [...initial.warnings];

  for (const step of steps) {
    const startedAt = now().toISOString();
    try {
      payload = await step.module.run(payload, initial.context as AssessmentContext);
      provenance.push({
        stage: step.stage,
        startedAt,
        completedAt: now().toISOString(),
        engine: { name: step.module.id, version: step.module.version },
        warnings: [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(`${step.stage}:${step.module.id}:${message}`);
      provenance.push({
        stage: step.stage,
        startedAt,
        completedAt: now().toISOString(),
        engine: { name: step.module.id, version: step.module.version },
        warnings: [message],
      });

      if (step.required || options.stopOnOptionalFailure) throw error;
    }
  }

  return { ...initial, payload, provenance, warnings };
}
