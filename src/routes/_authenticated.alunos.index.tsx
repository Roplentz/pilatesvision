import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/lib/studentsStore";
import { useAssessments } from "@/lib/assessmentsStore";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/alunos/")({
  component: AlunosListPage,
  head: () => ({
    meta: [
      { title: "Alunos | PilatesVision" },
      {
        name: "description",
        content:
          "Prontuário digital dos alunos da clínica: histórico, objetivos e avaliações.",
      },
    ],
  }),
});

function ageFrom(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function AlunosListPage() {
  const { clinicId } = useProfile();
  const { students, loading } = useStudents(clinicId);
  const { assessments } = useAssessments(clinicId);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.email?.toLowerCase().includes(needle) ||
        (s.goals ?? []).some((g) => g.toLowerCase().includes(needle)),
    );
  }, [students, q]);

  const countFor = (id: string) =>
    assessments.filter((a) => a.student_id === id).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/alunos/novo">
            <Button variant="hero">
              <Plus className="h-4 w-4" /> Novo aluno
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Prontuário digital
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Alunos
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {loading
                ? "Carregando alunos…"
                : `${students.length} aluno${students.length === 1 ? "" : "s"} cadastrado${students.length === 1 ? "" : "s"} na clínica.`}
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, e-mail ou objetivo…"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum aluno encontrado para "{q}".
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to="/alunos/$id"
                  params={{ id: s.id }}
                  className="group block h-full rounded-xl border border-border/60 bg-card/40 p-5 transition hover:border-primary/60 hover:bg-card/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {s.name
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ageFrom(s.birthDate)} anos · {s.gender}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(s.goals ?? []).slice(0, 2).map((g) => (
                      <Badge key={g} variant="secondary" className="text-[10px]">
                        {g}
                      </Badge>
                    ))}
                    {(s.goals ?? []).length > 2 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{(s.goals ?? []).length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>{s.height_cm ?? "—"} cm · {s.weight_kg ?? "—"} kg</span>
                    <span>
                      {countFor(s.id)} avaliaç{countFor(s.id) === 1 ? "ão" : "ões"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
