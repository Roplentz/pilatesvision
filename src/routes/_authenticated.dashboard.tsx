import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Archive,
  ClipboardCheck,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { usePatients, usePatientCounts } from "@/lib/patientsStore";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | PilatesVision" }] }),
  component: DashboardPage,
});

type ClinicalCounts = {
  assessments: number;
  reports: number;
};

function useClinicalCounts(clinicId: string | null | undefined) {
  const [counts, setCounts] = useState<ClinicalCounts>({ assessments: 0, reports: 0 });
  const [loading, setLoading] = useState(Boolean(clinicId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clinicId) {
      setCounts({ assessments: 0, reports: 0 });
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      supabase
        .from("assessments")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId),
    ]).then(([assessmentsResult, reportsResult]) => {
      if (cancelled) return;

      const firstError = assessmentsResult.error ?? reportsResult.error;
      if (firstError) {
        setError(new Error(firstError.message));
      } else {
        setCounts({
          assessments: assessmentsResult.count ?? 0,
          reports: reportsResult.count ?? 0,
        });
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return { counts, loading, error };
}

function DashboardPage() {
  const { clinicId, loading: profileLoading } = useProfile();
  const { patients, loading: patientsLoading } = usePatients(clinicId, { status: "active" });
  const { counts: patientCounts, loading: patientCountsLoading } = usePatientCounts(clinicId);
  const {
    counts: clinicalCounts,
    loading: clinicalCountsLoading,
    error: clinicalCountsError,
  } = useClinicalCounts(clinicId);

  const loading =
    profileLoading || patientsLoading || patientCountsLoading || clinicalCountsLoading;

  const stats = [
    { label: "Pacientes ativos", value: patientCounts.active, icon: Users },
    { label: "Pacientes arquivados", value: patientCounts.archived, icon: Archive },
    { label: "Avaliações", value: clinicalCounts.assessments, icon: ClipboardCheck },
    { label: "Relatórios", value: clinicalCounts.reports, icon: FileText },
  ];

  const recent = patients.slice(0, 5);

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
            <Plus className="mr-1 h-4 w-4" /> Cadastrar paciente
          </Button>
        </Link>
      </header>

      {clinicalCountsError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
          Não foi possível atualizar todas as métricas clínicas. Recarregue a página para tentar
          novamente.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-surface/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <stat.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {loading ? <Skeleton className="h-7 w-10" /> : stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
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
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
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
            {recent.map((patient) => (
              <Link
                key={patient.id}
                to="/alunos/$id"
                params={{ id: patient.id }}
                className="flex items-center justify-between py-3 hover:opacity-80"
              >
                <div>
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {patient.goals?.join(", ") ?? ""}
                  </div>
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
              <span>Abrir relatórios</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
