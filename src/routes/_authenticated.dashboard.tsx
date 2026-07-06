import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ClipboardCheck, FileText, Plus, ArrowRight } from "lucide-react";
import { useStudents } from "@/lib/studentsStore";
import { useProfile } from "@/hooks/useProfile";
import { useClinicCounts } from "@/lib/clinicsStore";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | PilatesVision" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { clinicId, loading: profileLoading } = useProfile();
  const { students, loading: studentsLoading } = useStudents(clinicId);
  const { counts, loading: countsLoading } = useClinicCounts(clinicId);

  const loading = profileLoading || studentsLoading || countsLoading;

  const stats = [
    { label: "Pacientes cadastrados", value: counts.students, icon: Users },
    { label: "Avaliações criadas", value: counts.assessments, icon: ClipboardCheck },
    { label: "Relatórios gerados", value: counts.reports, icon: FileText },
  ];

  const recent = students.slice(0, 5);
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Fluxo MVP: paciente, avaliação, relatório e PDF.
          </p>
        </div>
        <Link to="/alunos/novo">
          <Button variant="hero" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Cadastrar primeiro paciente
          </Button>
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="bg-surface/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {loading ? <Skeleton className="h-7 w-10" /> : s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pacientes recentes</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {loading && recent.length === 0 && (
              <div className="space-y-3 py-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
            {!loading && recent.length === 0 && (
              <div className="space-y-4 py-6 text-sm text-muted-foreground">
                <p>Nenhum paciente cadastrado ainda.</p>
                <Link to="/alunos/novo">
                  <Button size="sm" variant="outline">
                    Cadastrar primeiro paciente
                  </Button>
                </Link>
              </div>
            )}
            {recent.map((st) => (
              <Link
                key={st.id}
                to="/alunos/$id"
                params={{ id: st.id }}
                className="flex items-center justify-between py-3 hover:opacity-80"
              >
                <div>
                  <div className="font-medium">{st.name}</div>
                  <div className="text-xs text-muted-foreground">{st.goals?.join(", ") ?? ""}</div>
                </div>
                <Badge variant="secondary">Ver</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Link
              to="/alunos/novo"
              className="flex items-center justify-between rounded-md border border-border/60 p-3 transition hover:bg-muted/40"
            >
              <span>Cadastrar paciente</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/avaliacoes/nova"
              className="flex items-center justify-between rounded-md border border-border/60 p-3 transition hover:bg-muted/40"
            >
              <span>Criar avaliação</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/relatorios"
              className="flex items-center justify-between rounded-md border border-border/60 p-3 transition hover:bg-muted/40"
            >
              <span>Gerar relatório</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
