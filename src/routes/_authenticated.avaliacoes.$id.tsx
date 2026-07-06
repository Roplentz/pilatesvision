import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  FileText,
  Loader2,
  ScanLine,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssessment, useAssessmentExtras } from "@/lib/assessmentsStore";

export const Route = createFileRoute("/_authenticated/avaliacoes/$id")({
  component: AvaliacaoDetailPage,
  head: () => ({ meta: [{ title: "Avaliação | PilatesVision" }] }),
});

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  in_progress: "Em andamento",
  completed: "Concluída",
  archived: "Arquivada",
};

const stageLabel: Record<string, string> = {
  ficha: "Ficha",
  postural: "Postural",
  dinamica: "Dinâmica",
  exercicios: "Exercícios",
  relatorio: "Relatório",
};

const severityTone: Record<string, string> = {
  leve: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  moderado: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  acentuado: "bg-red-500/15 text-red-300 border-red-500/30",
};

type Finding = { region?: string; description?: string; severity?: string };

function AvaliacaoDetailPage() {
  const { id } = Route.useParams();
  const { assessment, loading } = useAssessment(id);
  const {
    postural,
    movement,
    prescribed,
    report,
    loading: extrasLoading,
  } = useAssessmentExtras(id);

  if (loading || extrasLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Avaliação não encontrada.</p>
          <Link to="/avaliacoes" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const findings: Finding[] = Array.isArray(postural?.findings)
    ? (postural!.findings as Finding[])
    : [];
  const posturalAnalysisText =
    postural?.findings && !Array.isArray(postural.findings)
      ? ((postural.findings as { analysis?: string }).analysis ?? null)
      : null;

  const movementMetrics = movement
    ? [
        { label: "Controle", value: movement.controle },
        { label: "Estabilidade", value: movement.estabilidade },
        { label: "Simetria", value: movement.simetria },
        { label: "Amplitude", value: movement.amplitude },
      ].filter((m) => m.value != null)
    : [];

  const reportContent =
    (report?.content as {
      summary?: string;
      recommendations?: string[];
      postural?: string;
      dinamica?: string;
      exercicio?: string;
    } | null) ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/avaliacoes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Avaliações
          </Link>
          <Badge
            variant={assessment.status === "completed" ? "default" : "secondary"}
            className="text-[11px]"
          >
            {statusLabel[assessment.status] ?? assessment.status}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Etapa atual: {stageLabel[assessment.current_stage] ?? assessment.current_stage}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Avaliação de{" "}
            <Link
              to="/alunos/$id"
              params={{ id: assessment.student_id }}
              className="text-primary underline-offset-4 hover:underline"
            >
              {assessment.students?.name ?? "aluno"}
            </Link>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(assessment.created_at).toLocaleString("pt-BR")}
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="h-4 w-4 text-primary" /> Ficha
          </div>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <Field
              icon={<User className="h-4 w-4" />}
              label="Aluno"
              value={assessment.students?.name ?? "—"}
            />
            <Field label="Nível de dor" value={`${assessment.pain_level ?? 0}/10`} />
            <Field label="Queixa principal" value={assessment.main_complaint ?? "—"} />
          </div>
          {(assessment.goals ?? []).length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Objetivos</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(assessment.goals ?? []).map((g) => (
                  <Badge key={g} variant="secondary" className="text-[11px]">
                    <Target className="mr-1 h-3 w-3" /> {g}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {assessment.observations && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {assessment.observations}
            </p>
          )}
        </section>

        {postural && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ScanLine className="h-4 w-4 text-primary" /> Avaliação postural
            </div>
            {postural.score != null && (
              <div className="mt-2 text-xs text-muted-foreground">
                Score geral: <span className="font-semibold text-primary">{postural.score}</span>
              </div>
            )}
            {findings.length > 0 && (
              <ul className="mt-5 space-y-2">
                {findings.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-3 text-sm"
                  >
                    {f.severity && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${severityTone[f.severity] ?? ""}`}
                      >
                        {f.severity}
                      </Badge>
                    )}
                    <div>
                      <div className="font-medium">{f.region ?? "—"}</div>
                      <div className="text-muted-foreground">{f.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {posturalAnalysisText && (
              <div className="mt-5 whitespace-pre-wrap rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
                {posturalAnalysisText}
              </div>
            )}
          </section>
        )}

        {movement && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" /> Avaliação dinâmica
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {movementMetrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-border/40 bg-background/40 p-4"
                >
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold text-primary">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
            {(movement.movements_evaluated ?? []).length > 0 && (
              <div className="mt-4 text-xs text-muted-foreground">
                Movimentos avaliados: {(movement.movements_evaluated ?? []).join(", ")}
              </div>
            )}
          </section>
        )}

        {prescribed.length > 0 && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-primary" /> Prescrição
            </div>
            <ul className="mt-4 space-y-2">
              {prescribed.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{p.name ?? "Exercício"}</div>
                    {p.focus && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{p.focus}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.series ?? "—"}
                    {p.level ? ` · ${p.level}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {reportContent && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" /> Relatório
            </div>
            {reportContent.summary && (
              <p className="mt-4 text-sm leading-relaxed">{reportContent.summary}</p>
            )}
            {Array.isArray(reportContent.recommendations) && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {reportContent.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span> {r}
                  </li>
                ))}
              </ul>
            )}
            {(reportContent.postural || reportContent.dinamica || reportContent.exercicio) && (
              <div className="mt-4 space-y-4">
                {reportContent.postural && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary">
                      Parecer postural
                    </div>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border border-border/40 bg-background/40 p-4 text-sm leading-relaxed">
                      {reportContent.postural}
                    </div>
                  </div>
                )}
                {reportContent.dinamica && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary">
                      Parecer dinâmico
                    </div>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border border-border/40 bg-background/40 p-4 text-sm leading-relaxed">
                      {reportContent.dinamica}
                    </div>
                  </div>
                )}
                {reportContent.exercicio && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary">
                      Parecer do exercício
                    </div>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border border-border/40 bg-background/40 p-4 text-sm leading-relaxed">
                      {reportContent.exercicio}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
