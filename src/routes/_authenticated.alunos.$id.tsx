import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Mail,
  Phone,
  Ruler,
  Target,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudent } from "@/lib/studentsStore";
import { mockApi } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/alunos/$id")({
  component: AlunoDetailPage,
  head: () => ({
    meta: [{ title: "Aluno | PilatesVision" }],
  }),
});

function ageFrom(iso: string): number {
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

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

function AlunoDetailPage() {
  const { id } = Route.useParams();
  const student = getStudent(id);

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Aluno não encontrado.</p>
          <Link to="/alunos" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4" /> Voltar para alunos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const assessments = mockApi
    .listAssessments()
    .filter((a) => a.studentId === student.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Alunos
          </Link>
          <Link to="/nova-avaliacao">
            <Button variant="hero">
              <Activity className="h-4 w-4" /> Nova avaliação
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {student.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {student.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ageFrom(student.birthDate)} anos · {student.gender} · cadastrado em{" "}
              {new Date(student.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Contato
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {student.email ?? "—"}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {student.phone ?? "—"}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {new Date(student.birthDate).toLocaleDateString("pt-BR")}
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Antropometria
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                {student.heightCm} cm
              </li>
              <li className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                {student.weightKg} kg
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Objetivos
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {student.goals.length === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                student.goals.map((g) => (
                  <Badge key={g} variant="secondary" className="text-[11px]">
                    <Target className="mr-1 h-3 w-3" />
                    {g}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {(student.medicalHistory || student.contraindications?.length) && (
          <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Histórico clínico
            </div>
            {student.medicalHistory && (
              <p className="mt-3 text-sm leading-relaxed">{student.medicalHistory}</p>
            )}
            {student.contraindications && student.contraindications.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Contraindicações
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {student.contraindications.map((c) => (
                    <Badge key={c} variant="outline" className="text-[11px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Avaliações</h2>
          {assessments.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              Nenhuma avaliação registrada para este aluno.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {assessments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-5 py-4"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(a.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                      {stageLabel[a.currentStage]}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Dor: {a.painLevel}/10 · {a.goals.join(", ") || "—"}
                    </div>
                  </div>
                  <Badge
                    variant={a.status === "completed" ? "default" : "secondary"}
                    className="text-[11px]"
                  >
                    {statusLabel[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
