import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClinics } from "@/lib/clinicsStore";
import { mockApi } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/clinicas/")({
  component: ClinicasListPage,
  head: () => ({
    meta: [
      { title: "Clínicas | Kinetik" },
      {
        name: "description",
        content:
          "Rede de clínicas conectadas ao Kinetik: planos, contato e equipe.",
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
  const clinics = useClinics();
  const students = mockApi.listStudents();
  const professionals = mockApi.listProfessionals();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clinics;
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.address?.city.toLowerCase().includes(needle),
    );
  }, [clinics, q]);

  const studentCount = (id: string) =>
    students.filter((s) => s.clinicId === id).length;
  const profCount = (id: string) =>
    professionals.filter((p) => p.clinicId === id).length;

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
          <Link to="/clinicas/nova">
            <Button variant="hero">
              <Plus className="h-4 w-4" /> Nova clínica
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" /> Rede de clínicas
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Clínicas
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {clinics.length} clínica{clinics.length === 1 ? "" : "s"} conectada
              {clinics.length === 1 ? "" : "s"} ao Kinetik.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, e-mail ou cidade…"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma clínica encontrada para "{q}".
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to="/clinicas/$id"
                  params={{ id: c.id }}
                  className="group block h-full rounded-xl border border-border/60 bg-card/40 p-5 transition hover:border-primary/60 hover:bg-card/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium leading-tight">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.address ? `${c.address.city}/${c.address.state}` : "—"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      Plano {planLabel[c.plan]}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>
                      {profCount(c.id)} profissiona
                      {profCount(c.id) === 1 ? "l" : "is"}
                    </span>
                    <span>
                      {studentCount(c.id)} aluno{studentCount(c.id) === 1 ? "" : "s"}
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