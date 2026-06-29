import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssessments } from "@/lib/assessmentsStore";
import { useStudents } from "@/lib/studentsStore";

export const Route = createFileRoute("/_authenticated/avaliacoes/")({
  component: AvaliacoesListPage,
  head: () => ({
    meta: [
      { title: "Avaliações | Kinetik" },
      {
        name: "description",
        content:
          "Histórico de avaliações posturais e dinâmicas da clínica, por aluno.",
      },
    ],
  }),
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

function AvaliacoesListPage() {
  const assessments = useAssessments();
  const students = useStudents();
  const [q, setQ] = useState("");
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const studentMap = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assessments.filter((a) => {
      if (studentFilter !== "all" && a.studentId !== studentFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!needle) return true;
      const name = studentMap[a.studentId]?.name.toLowerCase() ?? "";
      return (
        name.includes(needle) ||
        a.mainComplaint?.toLowerCase().includes(needle) ||
        a.goals.some((g) => g.toLowerCase().includes(needle))
      );
    });
  }, [assessments, q, studentFilter, statusFilter, studentMap]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/avaliacoes/nova">
            <Button variant="hero">
              <Plus className="h-4 w-4" /> Nova avaliação
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Prontuário
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Avaliações
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {assessments.length} avaliaç{assessments.length === 1 ? "ão" : "ões"} no histórico.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por aluno, queixa ou objetivo…"
              className="pl-9"
            />
          </div>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Aluno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os alunos</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="archived">Arquivada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center text-sm text-muted-foreground">
            Nenhuma avaliação encontrada.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((a, i) => {
              const student = studentMap[a.studentId];
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to="/avaliacoes/$id"
                    params={{ id: a.id }}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 px-5 py-4 transition hover:border-primary/60 hover:bg-card/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {(student?.name ?? "?")
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium">
                          {student?.name ?? "Aluno removido"}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString("pt-BR")} ·
                          Etapa: {stageLabel[a.currentStage]} · Dor {a.painLevel}/10
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={a.status === "completed" ? "default" : "secondary"}
                        className="text-[11px]"
                      >
                        {statusLabel[a.status]}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
