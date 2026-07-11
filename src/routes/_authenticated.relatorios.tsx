import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios | PilatesVision" }] }),
  component: RelatoriosPage,
});

type ReportRow = {
  id: string;
  assessment_id: string;
  created_at: string;
  patients: { name: string } | null;
  assessments: { created_at: string } | null;
};

function RelatoriosPage() {
  const { clinicId, loading: profileLoading } = useProfile();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;
    if (!clinicId) {
      setReports([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("reports")
      .select("id, assessment_id, created_at, patients:patients(name), assessments(created_at)")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setReports((data ?? []) as unknown as ReportRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clinicId, profileLoading]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Documentos consolidados gerados a partir das avaliações.
          </p>
        </div>
        <Link to="/avaliacoes/nova">
          <Button variant="hero">
            <Plus className="h-4 w-4" /> Nova avaliação
          </Button>
        </Link>
      </header>

      {loading || profileLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/15 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="font-medium">Nenhum relatório ainda</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Conclua uma avaliação para gerar o primeiro relatório clínico.
              </p>
            </div>
            <Link to="/avaliacoes/nova">
              <Button variant="hero">
                <Plus className="h-4 w-4" /> Nova avaliação
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {reports.length} relatório{reports.length === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reports.map((r) => {
              const date = r.assessments?.created_at ?? r.created_at;
              return (
                <Link
                  key={r.id}
                  to="/avaliacoes/$id"
                  params={{ id: r.assessment_id }}
                  className="group flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4 transition hover:border-primary/60 hover:bg-card/60"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{r.patients?.name ?? "Aluno"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
