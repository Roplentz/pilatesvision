import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useClinic, useClinicCounts } from "@/lib/clinicsStore";

export const Route = createFileRoute("/_authenticated/clinicas/")({
  component: ClinicasListPage,
  head: () => ({
    meta: [
      { title: "Clínicas | PilatesVision" },
      {
        name: "description",
        content:
          "Rede de clínicas conectadas ao PilatesVision: planos, contato e equipe.",
      },
    ],
  }),
});

const planLabel: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function ClinicasListPage() {
  const { user } = useAuth();
  const { clinic, clinicId, loading } = useClinic(user?.id);
  const { counts } = useClinicCounts(clinicId);

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
          {!clinic && (
            <Link to="/clinicas/nova">
              <Button variant="hero">
                <Plus className="h-4 w-4" /> Cadastrar clínica
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Sua clínica
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Clínicas
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Você tem acesso aos dados da sua clínica vinculada.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !clinic ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma clínica vinculada ao seu perfil.
            </p>
            <Link to="/clinicas/nova" className="mt-4 inline-block">
              <Button variant="hero">
                <Plus className="h-4 w-4" /> Cadastrar clínica
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                to="/clinicas/$id"
                params={{ id: clinic.id }}
                className="group block h-full rounded-xl border border-border/60 bg-card/40 p-5 transition hover:border-primary/60 hover:bg-card/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium leading-tight">{clinic.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(clinic.address as { city?: string; state?: string } | null)
                          ?.city ?? "—"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    Plano {planLabel[clinic.plan] ?? clinic.plan}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <span>
                    {counts.assessments} avaliaç{counts.assessments === 1 ? "ão" : "ões"}
                  </span>
                  <span>
                    {counts.students} aluno{counts.students === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}