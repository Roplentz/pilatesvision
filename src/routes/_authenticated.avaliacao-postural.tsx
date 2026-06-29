import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageAnalyzer } from "@/components/ImageAnalyzer";

export const Route = createFileRoute("/_authenticated/avaliacao-postural")({
  head: () => ({ meta: [{ title: "Avaliação Postural | PilatesVision" }] }),
  component: PosturalPage,
});

const views = ["Vista anterior", "Vista lateral", "Vista posterior"] as const;

function PosturalPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Avaliação Postural</h1>
        <p className="text-sm text-muted-foreground">Envie uma foto de cada vista; a IA analisa alinhamento, assimetrias e compensações.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {views.map((v) => (
          <Card key={v} className="bg-surface/60">
            <CardHeader>
              <CardTitle className="text-base">{v}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageAnalyzer mode="postural" context={v} label={`Foto · ${v}`} compact />
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="rounded-md border border-border/60 bg-surface/40 p-3 text-xs text-muted-foreground">
        Os indicadores são apoio à decisão profissional e não substituem avaliação clínica.
      </p>
    </div>
  );
}