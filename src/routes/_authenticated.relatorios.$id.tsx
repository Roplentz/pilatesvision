import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSESSMENT_TYPE_LABEL,
  REPORT_DISCLAIMER,
  SEVERITY_LABEL,
  SUPPORT_LEVEL_LABEL,
  finalizeReport,
  normalizeReportJson,
  updateReport,
  useReport,
  type DynamicFindingJson,
  type ExerciseFindingJson,
  type InitialPlanItemJson,
  type PosturalFindingJson,
  type ReportJson,
  type Severity,
} from "@/lib/reportsStore";
import { SignedClinicalMedia } from "@/components/SignedClinicalMedia";

export const Route = createFileRoute("/_authenticated/relatorios/$id")({
  head: () => ({ meta: [{ title: "Relatório | PilatesVision" }] }),
  component: RelatorioDetailPage,
});

function RelatorioDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { report, loading, error, reload } = useReport(id);

  const [title, setTitle] = useState("");
  const [json, setJson] = useState<ReportJson>(() => normalizeReportJson(null));
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (!report) return;
    setTitle(report.title ?? "");
    setJson(normalizeReportJson(report.content));
  }, [report]);

  const isFinalized = report?.status === "finalized";
  const editable = !isFinalized;

  function patch(patchFn: (j: ReportJson) => ReportJson) {
    setJson((j) => patchFn(j));
  }

  async function handleSaveDraft() {
    if (!report) return;
    setSaving(true);
    try {
      await updateReport(report.id, { title, content: json });
      toast.success("Rascunho salvo.");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar rascunho.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    if (!report) return;
    setFinalizing(true);
    try {
      await finalizeReport(report.id, title, json);
      toast.success("Relatório finalizado.");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao finalizar.");
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !report) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar o relatório</AlertTitle>
          <AlertDescription>{error?.message ?? "Relatório não encontrado."}</AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" onClick={() => router.history.back()}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  const clinicName = json.clinic.name || "Clínica";
  const assessmentType =
    ASSESSMENT_TYPE_LABEL[json.assessment.type] ?? json.assessment.type ?? "Avaliação";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Barra fixa de ações — some no print */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-3">
          <Link
            to="/relatorios"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Relatórios
          </Link>
          <div className="flex items-center gap-2">
            {isFinalized ? (
              <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                <Lock className="h-3 w-3" /> Finalizado
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                Rascunho editável
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
            {editable && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saving || finalizing}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
                </Button>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleFinalize}
                  disabled={saving || finalizing}
                >
                  {finalizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Finalizar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Página premium */}
      <article className="mx-auto max-w-4xl px-6 py-10 print:max-w-none print:px-10 print:py-8">
        {/* 1 · Cabeçalho / Identidade */}
        <header className="flex flex-col gap-6 border-b border-border/70 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            {json.clinic.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={json.clinic.logo_url}
                alt={clinicName}
                className="h-14 w-14 rounded-lg object-cover ring-1 ring-border"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
                <span className="font-display text-xl font-semibold">
                  {clinicName.slice(0, 1)}
                </span>
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {clinicName}
              </div>
              <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                {isFinalized ? title || "Relatório clínico" : "Relatório clínico — rascunho"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {assessmentType} · {formatDate(json.assessment.date)}
              </p>
            </div>
          </div>
          <div className="grid gap-1 text-right text-xs text-muted-foreground md:min-w-[220px]">
            <ClinicHeaderField
              label="Profissional"
              value={json.clinic.professional}
              editable={editable}
              onChange={(v) =>
                patch((j) => ({ ...j, clinic: { ...j.clinic, professional: v } }))
              }
            />
            <ClinicHeaderField
              label="Registro (CREFITO/CREF)"
              value={json.clinic.professional_license}
              editable={editable}
              onChange={(v) =>
                patch((j) => ({ ...j, clinic: { ...j.clinic, professional_license: v } }))
              }
            />
          </div>
        </header>

        {!editable && (
          <div className="mt-8 print:hidden">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled
              className="max-w-xl"
            />
          </div>
        )}
        {editable && (
          <div className="mt-8">
            <Label htmlFor="report-title" className="text-xs uppercase tracking-wider text-muted-foreground">
              Título do relatório
            </Label>
            <Input
              id="report-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 max-w-xl"
            />
          </div>
        )}

        {/* 2 · Dados do paciente */}
        <Section number="02" title="Dados do paciente">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInline
              label="Nome"
              value={json.patient.full_name}
              editable={editable}
              onChange={(v) => patch((j) => ({ ...j, patient: { ...j.patient, full_name: v } }))}
            />
            <FieldInline
              label="Idade"
              value={String(json.patient.age || "")}
              editable={editable}
              onChange={(v) =>
                patch((j) => ({ ...j, patient: { ...j.patient, age: Number(v) || 0 } }))
              }
              suffix="anos"
            />
            <FieldInline
              label="Sexo"
              value={json.patient.sex}
              editable={editable}
              onChange={(v) => patch((j) => ({ ...j, patient: { ...j.patient, sex: v } }))}
            />
            <FieldInline
              label="Ocupação"
              value={json.patient.occupation ?? ""}
              editable={editable}
              onChange={(v) => patch((j) => ({ ...j, patient: { ...j.patient, occupation: v } }))}
            />
            <div className="sm:col-span-2">
              <FieldInline
                label="Objetivo principal do paciente"
                value={json.patient.main_goal}
                editable={editable}
                onChange={(v) =>
                  patch((j) => ({ ...j, patient: { ...j.patient, main_goal: v } }))
                }
              />
            </div>
          </div>
        </Section>

        {/* 3 · Dados da avaliação */}
        <Section number="03" title="Dados da avaliação">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <DefItem term="Data" desc={formatDate(json.assessment.date)} />
            <DefItem term="Profissional" desc={json.clinic.professional || "—"} />
            <DefItem term="Tipo" desc={assessmentType} />
          </dl>
        </Section>

        {/* 4 · Objetivo da avaliação */}
        <Section number="04" title="Objetivo da avaliação">
          <EditableText
            editable={editable}
            value={json.objective}
            rows={2}
            placeholder="Ex.: Reduzir dor lombar em 8 semanas mantendo prática regular de Pilates."
            onChange={(v) => patch((j) => ({ ...j, objective: v }))}
          />
        </Section>

        {/* 5 · Resumo clínico */}
        <Section number="05" title="Resumo clínico">
          <EditableText
            editable={editable}
            value={json.clinical_summary}
            rows={5}
            placeholder="Síntese objetiva do quadro atual e contexto da avaliação."
            onChange={(v) => patch((j) => ({ ...j, clinical_summary: v }))}
          />
        </Section>

        {/* 6 · Achados posturais */}
        {(json.postural_findings.length > 0 || editable) && (
          <Section number="06" title="Achados posturais observáveis">
            <PosturalFindingsEditor
              items={json.postural_findings}
              editable={editable}
              onChange={(items) =>
                patch((j) => ({ ...j, postural_findings: items }))
              }
            />
            <SectionFootnote>
              Achados observados em imagem estática; sujeitos a confirmação clínica presencial.
            </SectionFootnote>
          </Section>
        )}

        {/* 7 · Achados dinâmicos */}
        {(json.dynamic_findings.length > 0 || editable) && (
          <Section number="07" title="Achados dinâmicos">
            <DynamicFindingsEditor
              items={json.dynamic_findings}
              editable={editable}
              onChange={(items) => patch((j) => ({ ...j, dynamic_findings: items }))}
            />
            <SectionFootnote>Análise dependente de confirmação profissional.</SectionFootnote>
          </Section>
        )}

        {/* 8 · Exercícios avaliados */}
        {(json.exercise_findings.length > 0 || editable) && (
          <Section number="08" title="Exercícios avaliados">
            <ExerciseFindingsEditor
              items={json.exercise_findings}
              editable={editable}
              onChange={(items) => patch((j) => ({ ...j, exercise_findings: items }))}
            />
          </Section>
        )}

        {/* 9 · Recomendações */}
        {(json.recommendations.length > 0 || editable) && (
          <Section number="09" title="Recomendações">
            <StringListEditor
              items={json.recommendations}
              editable={editable}
              placeholder="Priorizar mobilidade de quadril antes de progredir carga."
              onChange={(items) => patch((j) => ({ ...j, recommendations: items }))}
            />
          </Section>
        )}

        {/* 10 · Plano inicial sugerido */}
        {(json.initial_plan.length > 0 || editable) && (
          <Section number="10" title="Plano inicial sugerido">
            <InitialPlanEditor
              items={json.initial_plan}
              editable={editable}
              onChange={(items) => patch((j) => ({ ...j, initial_plan: items }))}
            />
            <SectionFootnote>
              Plano inicial sugerido, a ajustar conforme resposta, dor e evolução.
            </SectionFootnote>
          </Section>
        )}

        {/* 11 · Observações do profissional (omitida se vazio e finalizado) */}
        {(json.professional_notes.trim().length > 0 || editable) && (
          <Section number="11" title="Observações do profissional">
            <EditableText
              editable={editable}
              value={json.professional_notes}
              rows={4}
              placeholder="Considerações clínicas adicionais do profissional responsável."
              onChange={(v) => patch((j) => ({ ...j, professional_notes: v }))}
            />
          </Section>
        )}

        {/* 12 · Disclaimer clínico (sempre) */}
        <section className="mt-12 rounded-xl border border-primary/25 bg-primary/[0.04] p-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              12 · Disclaimer clínico
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {REPORT_DISCLAIMER}
          </p>
        </section>

        {/* Rodapé de página */}
        <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          {clinicName} · Relatório de apoio à decisão profissional
        </footer>
      </article>
    </div>
  );
}

/* -------------------------------------------------------------------------
 *  Section wrappers
 * -----------------------------------------------------------------------*/

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 break-inside-avoid">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-xs font-medium uppercase tracking-[0.24em] text-primary">
          {number}
        </span>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SectionFootnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs italic text-muted-foreground">{children}</p>
  );
}

function DefItem({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="mt-0.5 text-sm">{desc || "—"}</dd>
    </div>
  );
}

function FieldInline({
  label,
  value,
  editable,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      {editable ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1"
        />
      ) : (
        <div className="mt-1 text-sm">
          {value || "—"}
          {value && suffix ? <span className="ml-1 text-muted-foreground">{suffix}</span> : null}
        </div>
      )}
    </div>
  );
}

function ClinicHeaderField({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
      {editable ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 max-w-[220px] text-right text-sm"
          placeholder="—"
        />
      ) : (
        <span className="text-sm text-foreground">{value || "—"}</span>
      )}
    </div>
  );
}

function EditableText({
  editable,
  value,
  onChange,
  rows,
  placeholder,
}: {
  editable: boolean;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
}) {
  if (!editable) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {value || "—"}
      </p>
    );
  }
  return (
    <Textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* -------------------------------------------------------------------------
 *  Postural findings editor
 * -----------------------------------------------------------------------*/

function PosturalFindingsEditor({
  items,
  editable,
  onChange,
}: {
  items: PosturalFindingJson[];
  editable: boolean;
  onChange: (items: PosturalFindingJson[]) => void;
}) {
  function update(idx: number, patch: Partial<PosturalFindingJson>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([
      ...items,
      { body_region: "", description: "", severity: "moderate" as Severity },
    ]);
  }
  if (items.length === 0 && !editable) return <EmptyLine />;
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-border/60 bg-card/30 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <FieldInline
              label="Região corporal"
              value={item.body_region}
              editable={editable}
              onChange={(v) => update(idx, { body_region: v })}
            />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Severidade
              </div>
              {editable ? (
                <select
                  value={item.severity}
                  onChange={(e) =>
                    update(idx, { severity: e.target.value as Severity })
                  }
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="low">Leve</option>
                  <option value="moderate">Moderada</option>
                  <option value="high">Importante</option>
                </select>
              ) : (
                <SeverityBadge severity={item.severity} />
              )}
            </div>
            {editable && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(idx)}
                  aria-label="Remover achado"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Descrição observável
            </div>
            {editable ? (
              <Textarea
                value={item.description}
                rows={2}
                onChange={(e) => update(idx, { description: e.target.value })}
                placeholder="Ex.: leve báscula pélvica anterior à direita, sugere ajuste na estabilização lombopélvica."
              />
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                {item.description || "—"}
              </p>
            )}
          </div>
          {item.image_url && (
            <div className="mt-3 max-w-xs">
              <SignedClinicalMedia path={item.image_url} kind="image" alt={item.body_region} />
            </div>
          )}
        </div>
      ))}
      {editable && (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar achado postural
        </Button>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const color =
    severity === "high"
      ? "bg-red-500/10 text-red-600"
      : severity === "moderate"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-emerald-500/10 text-emerald-600";
  return (
    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

/* -------------------------------------------------------------------------
 *  Dynamic findings editor
 * -----------------------------------------------------------------------*/

function DynamicFindingsEditor({
  items,
  editable,
  onChange,
}: {
  items: DynamicFindingJson[];
  editable: boolean;
  onChange: (items: DynamicFindingJson[]) => void;
}) {
  function update(idx: number, patch: Partial<DynamicFindingJson>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...items, { movement: "", compensations: [], quality_score: 0 }]);
  }
  if (items.length === 0 && !editable) return <EmptyLine />;
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <FieldInline
              label="Movimento"
              value={item.movement}
              editable={editable}
              onChange={(v) => update(idx, { movement: v })}
            />
            {editable && (
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Indicador de qualidade de movimento — apoio à decisão
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  style={{ width: `${Math.max(0, Math.min(100, item.quality_score))}%` }}
                />
              </div>
              {editable ? (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={item.quality_score}
                  onChange={(e) =>
                    update(idx, { quality_score: Number(e.target.value) || 0 })
                  }
                  className="w-20"
                />
              ) : (
                <span className="w-12 text-right text-sm tabular-nums">
                  {item.quality_score}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3">
            <StringListEditor
              label="Compensações observadas"
              items={item.compensations}
              editable={editable}
              placeholder="Ex.: valgo de joelho na fase excêntrica"
              onChange={(v) => update(idx, { compensations: v })}
            />
          </div>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Notas
            </div>
            {editable ? (
              <Textarea
                value={item.notes ?? ""}
                rows={2}
                onChange={(e) => update(idx, { notes: e.target.value })}
              />
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                {item.notes || "—"}
              </p>
            )}
          </div>
        </div>
      ))}
      {editable && (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar movimento
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 *  Exercise findings editor
 * -----------------------------------------------------------------------*/

function ExerciseFindingsEditor({
  items,
  editable,
  onChange,
}: {
  items: ExerciseFindingJson[];
  editable: boolean;
  onChange: (items: ExerciseFindingJson[]) => void;
}) {
  function update(idx: number, patch: Partial<ExerciseFindingJson>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([
      ...items,
      { exercise: "", support_level: 1, observations: [], suggested_cues: [] },
    ]);
  }
  if (items.length === 0 && !editable) return <EmptyLine />;
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <FieldInline
              label="Exercício"
              value={item.exercise}
              editable={editable}
              onChange={(v) => update(idx, { exercise: v })}
            />
            {editable && (
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Nível de suporte sugerido
            </div>
            {editable ? (
              <select
                value={item.support_level}
                onChange={(e) =>
                  update(idx, {
                    support_level: Number(e.target.value) as 0 | 1 | 2 | 3,
                  })
                }
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} · {SUPPORT_LEVEL_LABEL[n as 0 | 1 | 2 | 3]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-sm">
                <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.support_level}
                </span>
                {SUPPORT_LEVEL_LABEL[item.support_level]}
              </p>
            )}
          </div>
          <div className="mt-3">
            <StringListEditor
              label="Observações de execução"
              items={item.observations}
              editable={editable}
              placeholder="Ex.: perda de neutralidade lombar na descida"
              onChange={(v) => update(idx, { observations: v })}
            />
          </div>
          <div className="mt-3">
            <StringListEditor
              label="Cues sugeridos"
              items={item.suggested_cues ?? []}
              editable={editable}
              placeholder="Ex.: 'ombros longe das orelhas'"
              onChange={(v) => update(idx, { suggested_cues: v })}
            />
          </div>
        </div>
      ))}
      {editable && (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar exercício
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 *  Initial plan editor
 * -----------------------------------------------------------------------*/

function InitialPlanEditor({
  items,
  editable,
  onChange,
}: {
  items: InitialPlanItemJson[];
  editable: boolean;
  onChange: (items: InitialPlanItemJson[]) => void;
}) {
  function update(idx: number, patch: Partial<InitialPlanItemJson>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...items, { exercise: "", sets: 3, reps: 10, notes: "" }]);
  }
  if (items.length === 0 && !editable) return <EmptyLine />;
  return (
    <div className="space-y-3">
      <div className="hidden gap-3 text-xs uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1.6fr_0.5fr_0.5fr_1.6fr_auto]">
        <span>Exercício</span>
        <span>Séries</span>
        <span>Reps</span>
        <span>Notas</span>
        <span />
      </div>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="grid gap-3 rounded-lg border border-border/60 bg-card/30 p-3 sm:grid-cols-[1.6fr_0.5fr_0.5fr_1.6fr_auto] sm:items-center sm:p-2"
        >
          {editable ? (
            <Input
              value={item.exercise}
              onChange={(e) => update(idx, { exercise: e.target.value })}
              placeholder="Exercício"
            />
          ) : (
            <span className="text-sm font-medium">{item.exercise || "—"}</span>
          )}
          {editable ? (
            <Input
              type="number"
              min={0}
              value={item.sets}
              onChange={(e) => update(idx, { sets: Number(e.target.value) || 0 })}
            />
          ) : (
            <span className="text-sm">{item.sets || "—"}</span>
          )}
          {editable ? (
            <Input
              type="number"
              min={0}
              value={item.reps}
              onChange={(e) => update(idx, { reps: Number(e.target.value) || 0 })}
            />
          ) : (
            <span className="text-sm">{item.reps || "—"}</span>
          )}
          {editable ? (
            <Input
              value={item.notes ?? ""}
              onChange={(e) => update(idx, { notes: e.target.value })}
              placeholder="Ajustes / cuidados"
            />
          ) : (
            <span className="text-sm text-muted-foreground">{item.notes || "—"}</span>
          )}
          {editable && (
            <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {editable && (
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar exercício
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
 *  Reusable string-list editor
 * -----------------------------------------------------------------------*/

function StringListEditor({
  items,
  editable,
  onChange,
  placeholder,
  label,
}: {
  items: string[];
  editable: boolean;
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const clean = useMemo(() => items.filter((s) => s.trim().length > 0), [items]);
  function update(idx: number, value: string) {
    onChange(items.map((it, i) => (i === idx ? value : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...items, ""]);
  }
  if (!editable) {
    if (clean.length === 0) return <EmptyLine />;
    return (
      <div>
        {label && (
          <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        )}
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
          {clean.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div>
      {label && (
        <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      )}
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={it}
              placeholder={placeholder}
              onChange={(e) => update(idx, e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => remove(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
}

function EmptyLine() {
  return <p className="text-sm italic text-muted-foreground">Sem registros nesta seção.</p>;
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}