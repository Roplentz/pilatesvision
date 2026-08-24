import type { BridgeRepMetrics } from "@/lib/poseMetrics";

/**
 * Gráfico por repetição da Ponte (Pelvic Curl):
 * - barras da amplitude vertical do quadril (normalizada, coordenada de frame);
 * - barra empilhada do ciclo ascent (subida) / descent (descida) em segundos.
 * Puramente apresentacional. Indicadores de APOIO — requerem confirmação do profissional.
 */
export function BridgeRepChart({ reps }: { reps: BridgeRepMetrics[] }) {
  if (!reps.length) return null;

  const maxAmp = Math.max(...reps.map((r) => r.hip_vertical_amplitude), 0.001);
  const maxDur = Math.max(...reps.map((r) => r.ascent_s + r.descent_s), 0.001);

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-background/40 p-3">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Amplitude vertical do quadril por repetição
        </div>
        <div className="mt-2 flex items-end gap-2" role="img" aria-label="Amplitude por repetição">
          {reps.map((r) => {
            const h = Math.max(4, Math.round((r.hip_vertical_amplitude / maxAmp) * 80));
            return (
              <div key={r.index} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {r.hip_vertical_amplitude.toFixed(3)}
                </span>
                <div
                  className={`w-full rounded-t ${r.valid ? "bg-primary" : "bg-muted-foreground/40"}`}
                  style={{ height: `${h}px` }}
                  title={`Rep #${r.index}: ${r.hip_vertical_amplitude.toFixed(3)}`}
                />
                <span className="text-[10px] text-muted-foreground">#{r.index}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Ciclo subida / descida por repetição (s)
        </div>
        <div className="mt-2 space-y-1.5">
          {reps.map((r) => {
            const total = r.ascent_s + r.descent_s || 0.001;
            const up = (r.ascent_s / maxDur) * 100;
            const down = (r.descent_s / maxDur) * 100;
            return (
              <div key={r.index} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-[10px] text-muted-foreground">#{r.index}</span>
                <div className="flex h-3 flex-1 overflow-hidden rounded bg-muted/40">
                  <div
                    className="h-full bg-primary/80"
                    style={{ width: `${up}%` }}
                    title={`Subida ${r.ascent_s.toFixed(2)}s`}
                  />
                  <div
                    className="h-full bg-accent/70"
                    style={{ width: `${down}%` }}
                    title={`Descida ${r.descent_s.toFixed(2)}s`}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-[10px] text-muted-foreground">
                  {r.ascent_s.toFixed(2)}s / {r.descent_s.toFixed(2)}s
                </span>
                <span className="sr-only">{`total ${total.toFixed(2)}s`}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-primary/80" /> subida
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-accent/70" /> descida
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Indicador de apoio — requer confirmação do profissional.
      </p>
    </div>
  );
}
