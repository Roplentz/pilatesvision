export type EvidenceLevel = "experimental" | "emerging" | "supported" | "validated";

export interface MetricEvidence {
  metricId: string;
  displayName: string;
  definition: string;
  unit: string;
  requiredCapturePlane?: "sagittal" | "frontal" | "transverse" | "multiplanar";
  requiredQualityLevel?: "excellent" | "good" | "acceptable";
  population?: string[];
  knownError?: {
    value: number;
    unit: string;
    method?: string;
  };
  references: string[];
  algorithmVersion: string;
  evidenceLevel: EvidenceLevel;
  limitations: string[];
}

export interface EvidenceRegistry {
  registryVersion: string;
  metrics: Record<string, MetricEvidence>;
}

export function createEvidenceRegistry(
  registryVersion: string,
  evidence: MetricEvidence[],
): EvidenceRegistry {
  if (!registryVersion.trim()) throw new Error("evidence_registry_version_required");

  const metrics: Record<string, MetricEvidence> = {};
  for (const item of evidence) {
    validateMetricEvidence(item);
    if (metrics[item.metricId]) throw new Error(`duplicate_metric_evidence:${item.metricId}`);
    metrics[item.metricId] = item;
  }

  return { registryVersion, metrics };
}

export function validateMetricEvidence(evidence: MetricEvidence): void {
  if (!evidence.metricId.trim()) throw new Error("metric_evidence_id_required");
  if (!evidence.displayName.trim()) throw new Error("metric_evidence_name_required");
  if (!evidence.definition.trim()) throw new Error("metric_evidence_definition_required");
  if (!evidence.unit.trim()) throw new Error("metric_evidence_unit_required");
  if (!evidence.algorithmVersion.trim()) {
    throw new Error("metric_evidence_algorithm_version_required");
  }
  if (!evidence.limitations.length) throw new Error("metric_evidence_limitations_required");
}

export function findMetricEvidence(
  registry: EvidenceRegistry,
  metricId: string,
): MetricEvidence | undefined {
  return registry.metrics[metricId];
}
