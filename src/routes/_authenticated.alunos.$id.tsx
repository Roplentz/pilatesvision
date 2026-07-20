import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Archive,
  CalendarDays,
  Loader2,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { archivePatient, updatePatient, usePatient, type PatientStatus } from "@/lib/patientsStore";
import {
  usePatientAssessments,
  useAssessmentExtras,
  type AssessmentRow,
  type MovementResultRow,
  type PosturalResultRow,
} from "@/lib/assessmentsStore";
import { usePatientReports, ASSESSMENT_TYPE_LABEL } from "@/lib/reportsStore";
import { PatientConsentCard } from "@/components/PatientConsentCard";
import { toast } from "sonner";
import { ClipboardPlus, FileText, Plus, Download } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { exportPatientData } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/alunos/$id")({
  component: AlunoDetailPage,
  head: () => ({
    meta: [{ title: "Paciente | PilatesVision" }],
  }),
});

function ageFrom(iso: string | null, fallback: number | null): number | null {
  if (fallback != null) return fallback;
  if (!iso) return null;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

const statusLabel: Record<PatientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
};

function AlunoDetailPage() {
  const exportFn = useServerFn(exportPatientData);
  const [exporting, setExporting] = useState(false);
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { patient, loading } = usePatient(id);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    age: "",
    gender: "F" as "F" | "M" | "outro",
    main_goal: "",
    main_complaint: "",
    clinical_notes: "",
    status: "active" as PatientStatus,
  });

  useEffect(() => {
    if (!patient) return;
    setForm({
      name: patient.name,
      email: patient.email ?? "",
      phone: patient.phone ?? "",
      birth_date: patient.birth_date ?? "",
      age: patient.age != null ? String(patient.age) : "",
      gender: (patient.gender as "F" | "M" | "outro") ?? "F",
      main_goal: patient.goals?.[0] ?? "",
      main_complaint: patient.main_complaint ?? "",
      clinical_notes: patient.clinical_notes ?? "",
      status: (patient.status as PatientStatus) ?? "active",
    });
  }, [patient]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Paciente não encontrado.</p>
          <Link to="/alunos" className="mt-4 inline-block">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4" /> Voltar para pacientes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const age = ageFrom(patient.birth_date, patient.age);
  const st = (patient.status as PatientStatus) ?? "active";

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("E-mail inválido.");
      return;
    }
    setSaving(true);
    try {
      await updatePatient(patient.id, {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        birth_date: form.birth_date || null,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        goals: form.main_goal.trim() ? [form.main_goal.trim()] : null,
        main_complaint: form.main_complaint.trim() || null,
        clinical_notes: form.clinical_notes.trim() || null,
        status: form.status,
        updated_at: new Date().toISOString(),
      });
      toast.success("Paciente atualizado.");
      setEditing(false);
      // trigger reload via navigate to same route
      navigate({ to: "/alunos/$id", params: { id: patient.id }, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    try {
      await archivePatient(patient.id);
      toast.success("Paciente arquivado.");
      navigate({ to: "/alunos" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao arquivar.");
    }
  };

  const exportLgpd = async () => {
    setExporting(true);
    try {
      const result = await exportFn({ data: { patientId: patient.id } });
      const blob = new Blob([result.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = result.generatedAt.replace(/[:.]/g, "-");
      const safeName = (patient.name || "paciente").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `lgpd-${safeName}-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao exportar.";
      toast.error(
        msg === "Forbidden"
          ? "Apenas administradores da clínica podem exportar dados do paciente."
          : msg,
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Pacientes
          </Link>
          <div className="flex items-center gap-2">
            {!editing && st !== "archived" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4" /> Arquivar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Arquivar paciente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O paciente sairá da lista de ativos, mas o histórico é preservado. Você pode
                      encontrá-lo no filtro "Arquivados".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={archive}>Arquivar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!editing ? (
              <Button variant="hero" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" /> Cancelar
                </Button>
                <Button variant="hero" size="sm" onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {patient.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{patient.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {age != null ? `${age} anos · ` : ""}
              {patient.gender ?? "—"} · cadastrado em{" "}
              {new Date(patient.created_at).toLocaleDateString("pt-BR")}
              <Badge
                variant={st === "active" ? "default" : st === "archived" ? "outline" : "secondary"}
                className="text-[10px]"
              >
                {statusLabel[st]}
              </Badge>
            </p>
          </div>
        </div>

        {editing ? (
          <div className="mt-8 space-y-6 rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="birth">Data de nascimento</Label>
                <Input
                  id="birth"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Sexo</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v as typeof form.gender })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as PatientStatus })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="goal">Objetivo principal</Label>
              <Input
                id="goal"
                value={form.main_goal}
                onChange={(e) => setForm({ ...form, main_goal: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="complaint">Queixa principal</Label>
              <Input
                id="complaint"
                value={form.main_complaint}
                onChange={(e) => setForm({ ...form, main_complaint: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações clínicas</Label>
              <Textarea
                id="notes"
                rows={4}
                value={form.clinical_notes}
                onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Contato</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {patient.email ?? "—"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {patient.phone ?? "—"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {patient.birth_date
                      ? new Date(patient.birth_date).toLocaleDateString("pt-BR")
                      : "—"}
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Objetivo principal
                </div>
                <p className="mt-3 text-sm">{patient.goals?.[0] ?? "—"}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Queixa principal
                </div>
                <p className="mt-3 text-sm">{patient.main_complaint ?? "—"}</p>
              </div>
            </div>

            {patient.clinical_notes && (
              <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Observações clínicas
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {patient.clinical_notes}
                </p>
              </div>
            )}

            {patient.clinic_id && (
              <div className="mt-6">
                <PatientConsentCard patientId={patient.id} clinicId={patient.clinic_id} />
              </div>
            )}

            <div className="mt-10">
              <AssessmentsHistory patientId={patient.id} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const asmtStatusLabel: Record<string, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  processing: "Processando",
  archived: "Arquivada",
  completed: "Finalizada",
};
const asmtTypeLabel: Record<string, string> = {
  postural_static: "Postural",
  dynamic: "Dinâmica",
  pilates_exercise: "Por exercício",
  follow_up: "Completa",
};

function AssessmentsHistory({ patientId }: { patientId: string }) {
  const { assessments, loading } = usePatientAssessments(patientId);
  const { reports, loading: loadingReports } = usePatientReports(patientId);
  const reportByAssessment = new Map(reports.map((r) => [r.assessment_id, r]));
  const latestTwo = assessments.slice(0, 2);
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Histórico evolutivo</h2>
        <Link to="/avaliacoes/nova" search={{ patientId }}>
          <Button variant="hero" size="sm">
            <ClipboardPlus className="h-4 w-4" /> Nova avaliação
          </Button>
        </Link>
      </div>

      {latestTwo.length >= 2 && <EvolutionComparison a={latestTwo[0]} b={latestTwo[1]} />}

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Avaliações
      </h3>
      {loading ? (
        <div className="mt-4 flex justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
          Nenhuma avaliação registrada. Crie a primeira usando o botão acima.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {assessments.map((a) => {
            const summary =
              a.title?.trim() ||
              a.objective?.trim() ||
              a.main_complaint?.trim() ||
              "Sem resumo informado.";
            const rep = reportByAssessment.get(a.id);
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={a.status === "completed" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {asmtStatusLabel[a.status] ?? a.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {asmtTypeLabel[a.type] ?? a.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm">{summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/avaliacoes/$id" params={{ id: a.id }}>
                    <Button variant="outline" size="sm">
                      Abrir avaliação
                    </Button>
                  </Link>
                  {rep ? (
                    <Link to="/relatorios/$id" params={{ id: rep.id }}>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />{" "}
                        {rep.status === "finalized" ? "Abrir relatório" : "Continuar rascunho"}
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Relatórios
      </h3>
      {loadingReports ? (
        <div className="mt-4 flex justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center text-sm text-muted-foreground">
          Nenhum relatório gerado. Finalize uma avaliação e gere o relatório.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={r.status === "finalized" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {r.status === "finalized" ? "Finalizado" : "Rascunho"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm">{r.title ?? "Relatório clínico"}</p>
              </div>
              <Link to="/relatorios/$id" params={{ id: r.id }}>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" /> Abrir
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ============================ Comparação evolutiva ============================ */

function avgQuality(movs: MovementResultRow[]): number | null {
  const scores: number[] = [];
  for (const m of movs) {
    const vals = [m.controle, m.estabilidade, m.simetria, m.amplitude].filter(
      (v): v is number => typeof v === "number",
    );
    if (vals.length === 0) continue;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    scores.push(avg > 10 ? avg : avg * 10);
  }
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function topFindings(
  postural: PosturalResultRow | null,
  movement: MovementResultRow | null,
): string[] {
  const out: string[] = [];
  if (postural?.findings && Array.isArray(postural.findings)) {
    for (const f of postural.findings as Array<{ region?: string; finding?: string }>) {
      const label = [f.region, f.finding].filter(Boolean).join(" — ");
      if (label) out.push(label);
    }
  }
  if (movement?.compensations && Array.isArray(movement.compensations)) {
    for (const c of movement.compensations as Array<{ movement?: string; compensation?: string }>) {
      const label = [c.movement, c.compensation].filter(Boolean).join(" — ");
      if (label) out.push(label);
    }
  }
  return out.slice(0, 5);
}

function EvolutionComparison({ a, b }: { a: AssessmentRow; b: AssessmentRow }) {
  return (
    <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comparação das duas avaliações mais recentes
        </h3>
        <span className="text-xs text-muted-foreground">
          Leitura observacional — sem valor diagnóstico
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonColumn label="Mais recente" assessment={a} />
        <ComparisonColumn label="Anterior" assessment={b} />
      </div>
    </div>
  );
}

function ComparisonColumn({ label, assessment }: { label: string; assessment: AssessmentRow }) {
  const { postural, movement, prescribed, report } = useAssessmentExtras(assessment.id);
  const score = avgQuality(movement ? [movement] : []);
  const findings = topFindings(postural, movement);
  const recs = prescribed.length
    ? prescribed
        .map((p) => p.name)
        .filter(Boolean)
        .slice(0, 5)
    : [];
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium">
        {ASSESSMENT_TYPE_LABEL[assessment.type] ?? assessment.type}
      </p>
      <div className="mt-3 text-xs text-muted-foreground">Score geral (observacional)</div>
      <p className="text-lg font-semibold">{score != null ? `${score}/100` : "—"}</p>

      <div className="mt-3 text-xs text-muted-foreground">Principais achados observados</div>
      {findings.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
          {findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}

      <div className="mt-3 text-xs text-muted-foreground">Recomendações anteriores</div>
      {recs.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
          {recs.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}

      {report ? (
        <Link to="/relatorios/$id" params={{ id: report.id }} className="mt-3 inline-block">
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4" /> Abrir relatório
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
