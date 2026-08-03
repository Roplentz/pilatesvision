import type { AssessmentDomain, AssessmentModule, PipelineStage } from "./schema";

export class FmipModuleRegistry {
  private readonly modules = new Map<string, AssessmentModule>();

  register(module: AssessmentModule): void {
    const key = this.key(module.domain, module.stage, module.id);
    const existing = this.modules.get(key);
    if (existing && existing.version === module.version) {
      throw new Error(`Module already registered: ${key}@${module.version}`);
    }
    this.modules.set(key, module);
  }

  get(domain: AssessmentDomain, stage: PipelineStage, id: string): AssessmentModule | undefined {
    return this.modules.get(this.key(domain, stage, id));
  }

  list(domain?: AssessmentDomain): AssessmentModule[] {
    return [...this.modules.values()].filter((module) => !domain || module.domain === domain);
  }

  require(domain: AssessmentDomain, stage: PipelineStage, id: string): AssessmentModule {
    const module = this.get(domain, stage, id);
    if (!module) throw new Error(`Required FMIP module not found: ${domain}/${stage}/${id}`);
    if (module.status === "deprecated") {
      throw new Error(`Required FMIP module is deprecated: ${domain}/${stage}/${id}`);
    }
    return module;
  }

  private key(domain: AssessmentDomain, stage: PipelineStage, id: string): string {
    return `${domain}:${stage}:${id}`;
  }
}
