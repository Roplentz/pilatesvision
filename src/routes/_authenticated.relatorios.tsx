import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Download, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios | PilatesVision" }] }),
  component: RelatoriosPage,
});

const reports = [
  { id: "r1", student: "Ana Beatriz Souza", date: "2026-06-20", postural: 78, dynamic: 82 },
  { id: "r2", student: "Carlos Mendes", date: "2026-06-15", postural: 71, dynamic: 75 },
  { id: "r3", student: "Júlia Ribeiro", date: "2026-06-10", postural: 84, dynamic: 88 },
];

function RelatoriosPage() {
  const [selected, setSelected] = useState(reports[0]);

  const text = `Relatório — ${selected.student}\nData: ${selected.date}\nScore postural: ${selected.postural}/100\nScore dinâmico: ${selected.dynamic}/100`;

  return (
    <div className="mx-auto max-w-7xl grid gap-6 px-6 py-8 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition ${
                selected.id === r.id ? "border-primary bg-primary/10" : "border-border/60 hover:bg-muted/40"
              }`}
            >
              <div>
                <div className="font-medium">{r.student}</div>
                <div className="text-xs text-muted-foreground">{r.date}</div>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{selected.student}</CardTitle>
            <p className="text-xs text-muted-foreground">Avaliação em {selected.date}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => toast.success("Relatório salvo")}>
              <Save className="mr-1 h-4 w-4" /> Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast("PDF exportado (mock)")}>
              <Download className="mr-1 h-4 w-4" /> Exportar PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(text);
                toast.success("Texto copiado");
              }}
            >
              <Copy className="mr-1 h-4 w-4" /> Copiar texto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border/60 p-4">
              <div className="text-xs text-muted-foreground">Score postural</div>
              <div className="text-2xl font-semibold">{selected.postural}/100</div>
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <div className="text-xs text-muted-foreground">Score dinâmico</div>
              <div className="text-2xl font-semibold">{selected.dynamic}/100</div>
            </div>
          </div>

          <section>
            <h3 className="font-medium">Principais achados</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Assimetria discreta de ombros</li>
              <li>Leve anteriorização da cabeça</li>
              <li>Controle lombopélvico a desenvolver</li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium">Exercícios recomendados</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Hundred", "Shoulder Bridge", "Swan", "Cat Stretch"].map((e) => (
                <Badge key={e} variant="secondary">{e}</Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-medium">Conduta sugerida</h3>
            <p className="mt-2 text-muted-foreground">
              Sessões 2x/semana focadas em controle lombopélvico, mobilidade torácica
              e ativação do core. Reavaliar em 4 semanas.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}