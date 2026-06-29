import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/avaliacao-postural")({
  head: () => ({ meta: [{ title: "Avaliação Postural | PilatesVision" }] }),
  component: PosturalPage,
});

const views = ["Vista anterior", "Vista lateral", "Vista posterior"];

const findings = [
  "Assimetria discreta de ombros",
  "Leve anteriorização da cabeça",
  "Alinhamento pélvico preservado",
  "Atenção ao controle lombopélvico",
];

function PosturalPage() {
  const [analyzed, setAnalyzed] = useState<Record<string, boolean>>({});
  const allDone = views.every((v) => analyzed[v]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Avaliação Postural</h1>
        <p className="text-sm text-muted-foreground">Capture as três vistas para análise automática.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {views.map((v) => (
          <Card key={v} className="bg-surface/60">
            <CardHeader>
              <CardTitle className="text-base">{v}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid h-44 place-items-center rounded-md border border-dashed border-border/60 bg-background/40 text-muted-foreground">
                <Camera className="h-8 w-8 opacity-60" />
              </div>
              <Button
                variant={analyzed[v] ? "secondary" : "hero"}
                className="w-full"
                onClick={() => setAnalyzed((p) => ({ ...p, [v]: true }))}
              >
                {analyzed[v] ? "Analisado" : "Analisar postura"}
              </Button>
              <Badge variant={analyzed[v] ? "default" : "outline"} className="w-full justify-center">
                {analyzed[v] ? "Concluído" : "Pendente"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      {allDone && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-4xl font-semibold text-gradient">78/100</div>
            <div className="text-xs uppercase text-muted-foreground">Score postural</div>
            <ul className="mt-4 space-y-2 text-sm">
              {findings.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="rounded-md border border-border/60 bg-surface/40 p-3 text-xs text-muted-foreground">
        Os indicadores são apoio à decisão profissional e não substituem avaliação clínica.
      </p>
    </div>
  );
}