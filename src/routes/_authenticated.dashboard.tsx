import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardCheck, FileText, TrendingUp, Plus } from "lucide-react";
import { mockStudents, mockAssessments } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | PilatesVision" }] }),
  component: DashboardPage,
});

const stats = [
  { label: "Alunos ativos", value: mockStudents.length, icon: Users },
  { label: "Avaliações realizadas", value: mockAssessments.length, icon: ClipboardCheck },
  { label: "Relatórios gerados", value: 8, icon: FileText },
  { label: "Evolução média", value: "+12%", icon: TrendingUp },
];

function DashboardPage() {
  const recent = mockStudents.slice(0, 5);
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da clínica</p>
        </div>
        <Link to="/nova-avaliacao">
          <Button variant="hero" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Nova avaliação
          </Button>
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-surface/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alunos recentes</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/60">
            {recent.map((st) => (
              <Link
                key={st.id}
                to="/alunos/$id"
                params={{ id: st.id }}
                className="flex items-center justify-between py-3 hover:opacity-80"
              >
                <div>
                  <div className="font-medium">{st.name}</div>
                  <div className="text-xs text-muted-foreground">{st.goals?.join(", ")}</div>
                </div>
                <Badge variant="secondary">Ver</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas reavaliações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recent.slice(0, 3).map((st, i) => (
              <div key={st.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <span>{st.name}</span>
                <Badge>{`em ${(i + 1) * 7}d`}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}