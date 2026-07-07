import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCatalogPicker } from "@/components/ExerciseCatalogPicker";
import {
  CATEGORY_LABEL,
  LEVEL_LABEL,
  isPilatesCategory,
  type ExerciseCatalogItem,
} from "@/lib/exerciseCatalog";

export const Route = createFileRoute("/_authenticated/avaliacao-dinamica")({
  head: () => ({ meta: [{ title: "Avaliação Dinâmica | PilatesVision" }] }),
  component: DinamicaPage,
});

function DinamicaPage() {
  const [selected, setSelected] = useState<ExerciseCatalogItem | null>(null);
  const targetTable = selected
    ? isPilatesCategory(selected.category)
      ? "exercise_results"
      : "movement_results"
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Avaliação Dinâmica — triagem funcional + repertório Pilates
        </h1>
        <p className="text-sm text-muted-foreground">
          Catálogo unificado para triagem clínica: movimentos funcionais e o
          repertório do método Pilates (Mat, Reformer, Cadillac, Chair e Barril).
          Estimativa de apoio à decisão — requer confirmação clínica.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Selecione o exercício</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseCatalogPicker
            selectedName={selected?.name ?? null}
            onPick={(it) => setSelected(it)}
          />
          {selected && (
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{selected.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_LABEL[selected.category]}
                </Badge>
                {selected.apparatus !== "—" && (
                  <Badge variant="outline" className="text-[10px]">
                    {selected.apparatus}
                  </Badge>
                )}
                {selected.level && (
                  <Badge variant="outline" className="text-[10px]">
                    {LEVEL_LABEL[selected.level]}
                  </Badge>
                )}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Destino: {targetTable}
                </Badge>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-md border border-border/50 bg-background/40 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Para registrar foto, vídeo e a análise biomecânica automática
                  deste exercício, abra uma avaliação do aluno. O mesmo seletor
                  buscável está disponível dentro da avaliação e salva
                  automaticamente na tabela correta —{" "}
                  <span className="font-medium">movement_results</span> para
                  movimentos funcionais e{" "}
                  <span className="font-medium">exercise_results</span> para o
                  repertório Pilates. Mídia é opcional; fluxo manual segue
                  disponível.
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Button asChild variant="hero" size="sm">
                  <Link to="/avaliacoes">Ir para Avaliações</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Estimativa clínica — apoio à decisão. Não é diagnóstico. Requer
        confirmação profissional.
      </p>
    </div>
  );
}
