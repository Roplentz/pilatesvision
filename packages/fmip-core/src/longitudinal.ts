export interface BaselineMetric {
  metricId: string;
  value: number;
  confidence?: number;
}

export interface PatientBaseline {
  protocolId: string;
  protocolVersion: string;
  capturedAt: string;
  metrics: BaselineMetric[];
}

export interface CurrentMetric extends BaselineMetric {
  capturedAt?: string;
}

export interface LongitudinalChange {
  metricId: string;
  baseline?: number;
  current?: number;
  absoluteChange?: number;
  percentChange?: number;
  confidence: number;
  status: "comparable" | "missing-baseline" | "missing-current";
}

export function compareToBaseline(
  baseline: PatientBaseline,
  current: CurrentMetric[],
): LongitudinalChange[] {
  const baselineMap = new Map(baseline.metrics.map((metric) => [metric.metricId, metric]));
  const currentMap = new Map(current.map((metric) => [metric.metricId, metric]));
  const metricIds = new Set([...baselineMap.keys(), ...currentMap.keys()]);

  return [...metricIds].sort().map((metricId) => {
    const base = baselineMap.get(metricId);
    const now = currentMap.get(metricId);

    if (!base) {
      return {
        metricId,
        current: now?.value,
        confidence: now?.confidence ?? 0,
        status: "missing-baseline" as const,
      };
    }

    if (!now) {
      return {
        metricId,
        baseline: base.value,
        confidence: base.confidence ?? 0,
        status: "missing-current" as const,
      };
    }

    const absoluteChange = now.value - base.value;
    const percentChange =
      base.value === 0 ? undefined : (absoluteChange / Math.abs(base.value)) * 100;
    const confidence = Math.min(base.confidence ?? 1, now.confidence ?? 1);

    return {
      metricId,
      baseline: base.value,
      current: now.value,
      absoluteChange,
      percentChange,
      confidence,
      status: "comparable" as const,
    };
  });
}
