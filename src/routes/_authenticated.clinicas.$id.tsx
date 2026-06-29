import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClinic } from "@/lib/clinicsStore";
import { mockApi } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/clinicas/$id")({
  component: ClinicaDetailPage,
  head: () => ({
    meta: [{ title: "Clínica | Kinetik" }],
  }),
});

const planLabel: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function ClinicaDetailPage() {
  const { id } = Route.useParams();
  const clinic = getClinic(id);

  if (!clinic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Clínica não encontrada.</p>
          <Link to="/clinicas" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4" /> Voltar para clínicas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const professionals = mockApi
    .listProfessionals()
    .filter((p) => p.clinicId === clinic.id);
  const students = mockApi
    .listStudents()
    .filter((s) => s.clinicId === clinic.id);
  const assessments = mockApi
    .listAssessments()
    .filter((a) => a.clinicId === clinic.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/clinicas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Clínicas
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {clinic.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {clinic.slug} · cadastrada em{" "}
              {new Date(clinic.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Badge variant="secondary" className="text-[11px]">
            <Sparkles className="mr-1 h-3 w-3" />
            Plano {planLabel[clinic.plan]}
          </Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Contato
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {clinic.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {clinic.phone ?? "—"}
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5 md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Endereço
            </div>
            {clinic.address ? (
              <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  {clinic.address.street}
                  <br />
                  {clinic.address.city}/{clinic.address.state} · CEP{" "}
                  {clinic.address.zip}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Endereço não informado.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Profissionais
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {professionals.length}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Alunos
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {students.length}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Avaliações
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">
              {assessments.length}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Equipe</h2>
          {professionals.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              Nenhum profissional vinculado a esta clínica.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {professionals.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {p.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.specialty}
                        {p.license ? ` · ${p.license}` : ""}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    {p.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Users className="h-4 w-4" /> Alunos da clínica
          </h2>
          {students.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              Nenhum aluno cadastrado.
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/alunos/$id"
                    params={{ id: s.id }}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-5 py-4 transition hover:border-primary/60"
                  >
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.goals[0] ?? "—"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}