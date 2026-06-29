import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dinamica")({
  head: () => ({ meta: [{ title: "Avaliação Dinâmica | PilatesVision" }] }),
  component: DinamicaPage,
});

const movements = [
  "Agachamento",
  "Ponte",
  "Lunge",
  "Apoio unipodal",
  "Sentar e levantar",
  "Single Leg Stretch",
];

const metrics = [
  { label: "Controle motor", value: "82/100" },
  { label: "Estabilidade", value: "76/100" },
  { label: "Simetria", value: "88/100" },
  { label: "Amplitude", value: "adequada" },
];

function DinamicaPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Avaliação Dinâmica</h1>
        <p className="text-sm text-muted-foreground">Selecione um movimento para analisar.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {movements.map((m) => (
          <Button
            key={m}
            variant={selected === m ? "hero" : "outline"}
            onClick={() => setSelected(m)}
            className="h-16 justify-start"
          >
            {m}
          </Button>
        ))}
      </section>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado — {selected}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-md border border-border/60 bg-surface/60 p-4">
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="mt-1 text-2xl font-semibold">{m.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-medium">Compensações</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">Leve valgo dinâmico</Badge>
                <Badge variant="secondary">Perda de controle lombopélvico</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}