import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageAnalyzer } from "@/components/ImageAnalyzer";

export const Route = createFileRoute("/_authenticated/avaliacao-dinamica")({
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

function DinamicaPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Avaliação Dinâmica</h1>
        <p className="text-sm text-muted-foreground">
          Análise da qualidade do movimento em exercícios funcionais e Pilates.
        </p>
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
          <CardContent>
            <ImageAnalyzer
              mode="dinamica"
              context={`Movimento avaliado: ${selected}`}
              label={`Frame do movimento · ${selected}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
