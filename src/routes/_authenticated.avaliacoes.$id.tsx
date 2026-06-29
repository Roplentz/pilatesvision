import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  FileText,
  ScanLine,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAssessment } from "@/lib/assessmentsStore";
import { getStudent } from "@/lib/studentsStore";
import { mockApi } from "@/lib/mockData";

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

function AvaliacaoDetailPage() {
  const { id } = Route.useParams();
  const assessment = getAssessment(id);

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

  const student = getStudent(assessment.studentId);
  const professional = mockApi
    .listProfessionals()
    .find((p) => p.id === assessment.professionalId);
  const exercises = mockApi.listExercises();
  const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));

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
            {statusLabel[assessment.status]}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        {/* Cabeçalho */}
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Etapa atual: {stageLabel[assessment.currentStage]}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Avaliação de{" "}
            {student ? (
              <Link
                to="/alunos/$id"
                params={{ id: student.id }}
                className="text-primary underline-offset-4 hover:underline"
              >
                {student.name}
              </Link>
            ) : (
              "aluno"
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(assessment.createdAt).toLocaleString("pt-BR")} ·{" "}
            {professional?.name ?? "—"}
          </p>
        </section>

        {/* Ficha */}
        <section className="rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ClipboardList className="h-4 w-4 text-primary" /> Ficha
          </div>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <Field
              icon={<User className="h-4 w-4" />}
              label="Aluno"
              value={student?.name ?? "—"}
            />
            <Field
              label="Nível de dor"
              value={`${assessment.painLevel}/10`}
            />
            <Field
              label="Queixa principal"
              value={assessment.mainComplaint ?? "—"}
            />
          </div>
          {assessment.goals.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Objetivos
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {assessment.goals.map((g) => (
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

        {/* Postural */}
        {assessment.postural && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ScanLine className="h-4 w-4 text-primary" /> Avaliação postural
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {Object.entries(assessment.postural.scores).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-border/40 bg-background/40 p-4"
                >
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {k}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold text-primary">
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <ul className="mt-5 space-y-2">
              {assessment.postural.findings.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-3 text-sm"
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${severityTone[f.severity]}`}
                  >
                    {f.severity}
                  </Badge>
                  <div>
                    <div className="font-medium">{f.region}</div>
                    <div className="text-muted-foreground">{f.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Dinâmica */}
        {assessment.movement && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" /> Avaliação dinâmica
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Score geral:{" "}
              <span className="font-semibold text-primary">
                {assessment.movement.overallScore}
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {assessment.movement.analyses.map((a, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/40 bg-background/40 p-4"
                >
                  <div className="font-medium">{a.exerciseName}</div>
                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    {a.metrics.map((m) => (
                      <div key={m.label} className="text-sm">
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                        <div className="font-semibold text-primary">{m.value}</div>
                      </div>
                    ))}
                  </div>
                  {a.compensations.length > 0 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      Compensações: {a.compensations.join("; ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prescrição */}
        {assessment.prescription && assessment.prescription.length > 0 && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-primary" /> Prescrição
            </div>
            <ul className="mt-4 space-y-2">
              {assessment.prescription.map((p) => {
                const ex = exById[p.exerciseId];
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">{ex?.name ?? p.exerciseId}</div>
                      {p.notes && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {p.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.sets}×{p.reps}
                      {p.tempo ? ` · ${p.tempo}` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Relatório */}
        {assessment.report && (
          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" /> Relatório
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              {assessment.report.summary}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {assessment.report.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span> {r}
                </li>
              ))}
            </ul>
            {assessment.report.nextReviewDate && (
              <div className="mt-4 text-xs text-muted-foreground">
                Próxima reavaliação:{" "}
                {new Date(assessment.report.nextReviewDate).toLocaleDateString("pt-BR")}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
