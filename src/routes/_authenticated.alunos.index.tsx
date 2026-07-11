import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients, type PatientStatus } from "@/lib/patientsStore";
import { useProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/alunos/")({
  component: AlunosListPage,
  head: () => ({
    meta: [
      { title: "Alunos | PilatesVision" },
      {
        name: "description",
        content: "Prontuário digital dos alunos da clínica: histórico, objetivos e avaliações.",
      },
    ],
  }),
});

function ageFrom(iso: string | null, fallback: number | null): number | null {
  if (fallback != null) return fallback;
  if (!iso) return null;
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

type StatusFilter = PatientStatus | "all";

const statusLabels: Record<PatientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
};

function AlunosListPage() {
  const { clinicId } = useProfile();
  const [status, setStatus] = useState<StatusFilter>("active");
  const { patients, loading } = usePatients(clinicId, { status });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter((s) => s.name.toLowerCase().includes(needle));
  }, [patients, q]);

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
              <Plus className="h-4 w-4" /> Novo paciente
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
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Pacientes</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {loading
                ? "Carregando pacientes…"
                : `${patients.length} paciente${patients.length === 1 ? "" : "s"} ${status === "all" ? "no total" : status === "active" ? "ativo(s)" : status === "inactive" ? "inativo(s)" : "arquivado(s)"} na clínica.`}
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome…"
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="inactive">Inativos</TabsTrigger>
            <TabsTrigger value="archived">Arquivados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 && !loading ? (
          patients.length === 0 && !q ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum paciente{" "}
                {status === "active" ? "ativo " : status === "archived" ? "arquivado " : ""}
                cadastrado ainda.
              </p>
              <Link to="/alunos/novo" className="mt-4 inline-block">
                <Button variant="hero">
                  <Plus className="h-4 w-4" /> Cadastrar primeiro paciente
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum paciente encontrado{q ? ` para "${q}"` : ""}.
              </p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Idade</th>
                  <th className="px-4 py-3">Queixa principal</th>
                  <th className="px-4 py-3">Objetivo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Atualizado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((s) => {
                  const age = ageFrom(s.birth_date, s.age);
                  const st = (s.status as PatientStatus) ?? "active";
                  return (
                    <tr key={s.id} className="transition hover:bg-card/60">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {age != null ? `${age} anos` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.main_complaint ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.goals?.[0] ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            st === "active"
                              ? "default"
                              : st === "archived"
                                ? "outline"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {statusLabels[st]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(s.updated_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/alunos/$id"
                          params={{ id: s.id }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Abrir perfil
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
