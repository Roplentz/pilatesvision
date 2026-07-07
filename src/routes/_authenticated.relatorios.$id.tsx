import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Printer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_DISCLAIMER,
  REPORT_REQUIRED_FIELDS,
  ReportValidationError,
  finalizeReport,
  reportFieldLabel,
  updateReport,
  useReport,
  validateReportForFinalization,
  type ReportContent,
  type ReportFieldKey,
  type ReportValidationErrors,
} from "@/lib/reportsStore";
import { useAssessmentResults } from "@/lib/assessmentsStore";
import { SignedClinicalMedia } from "@/components/SignedClinicalMedia";
import { isAutoMetricsSummary, type AutoMetricsSummary } from "@/lib/poseMetrics";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/relatorios/$id")({
  head: () => ({ meta: [{ title: "Relatório | PilatesVision" }] }),
  component: RelatorioDetailPage,
});

function RelatorioDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { report, loading, error, reload } = useReport(id);
  const { postural, movement } = useAssessmentResults(report?.assessment_id ?? null);
  const posturalMedia = postural.filter((p) => Boolean(p.image_url));
  const movementMedia = movement.filter((m) => Boolean(m.video_url));
  const hasMedia = posturalMedia.length > 0 || movementMedia.length > 0;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ReportContent>({});
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [attemptedFinalize, setAttemptedFinalize] = useState(false);
  const [errors, setErrors] = useState<ReportValidationErrors>({});

  useEffect(() => {
    if (!report) return;
    setTitle(report.title ?? "");
    setContent((report.content as ReportContent | null) ?? {});
    setErrors({});
    setAttemptedFinalize(false);
  }, [report]);

  const isFinalized = report?.status === "finalized";
  const liveErrors = useMemo(
    () => validateReportForFinalization(title, content),
    [title, content],
  );
  const displayErrors: ReportValidationErrors = attemptedFinalize ? liveErrors : errors;
  const missingCount = Object.keys(liveErrors).length;
  const canFinalize = missingCount === 0 && !isFinalized;

  function setField<K extends keyof ReportContent>(key: K, value: ReportContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function handleSaveDraft() {
    if (!report) return;
    setSaving(true);
    try {
      await updateReport(report.id, { title, content });
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
    setAttemptedFinalize(true);
    const v = validateReportForFinalization(title, content);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      toast.error("Preencha todos os campos obrigatórios antes de finalizar.");
      const first = document.querySelector<HTMLElement>("[data-report-error='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setFinalizing(true);
    try {
      await finalizeReport(report.id, title, content);
      toast.success("Relatório finalizado.");
      reload();
    } catch (e) {
      if (e instanceof ReportValidationError) {
        setErrors(e.errors);
        toast.error("Existem campos obrigatórios pendentes.");
      } else {
        toast.error(e instanceof Error ? e.message : "Falha ao finalizar.");
      }
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8 print:max-w-none print:px-0 print:py-0">
      <header className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link to="/relatorios" className="text-xs text-muted-foreground hover:text-foreground">
            ← Relatórios
          </Link>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">Relatório clínico</h1>
          <p className="text-sm text-muted-foreground">
            Paciente: {report.students?.name ?? "—"} · Versão {report.version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFinalized ? (
            <Badge className="gap-1 bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-3 w-3" /> Finalizado
            </Badge>
          ) : (
            <Badge variant="outline">Rascunho</Badge>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </Button>
        </div>
      </header>

      {!isFinalized && attemptedFinalize && missingCount > 0 && (
        <Alert variant="destructive" data-report-error="true">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {missingCount} campo{missingCount === 1 ? "" : "s"} obrigatório
            {missingCount === 1 ? "" : "s"} pendente{missingCount === 1 ? "" : "s"}
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {REPORT_REQUIRED_FIELDS.filter((k) => liveErrors[k]).map((k) => (
                <li key={k}>
                  <span className="font-medium">{reportFieldLabel(k)}:</span> {liveErrors[k]}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FieldLabel required htmlFor="title" error={displayErrors.title}>
            Título do relatório
          </FieldLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isFinalized}
            aria-invalid={Boolean(displayErrors.title)}
            className={displayErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            data-report-error={displayErrors.title ? "true" : undefined}
          />
          <FieldError message={displayErrors.title} />
        </CardContent>
      </Card>

      <TextareaSection
        id="summary"
        label="Resumo clínico"
        placeholder="Síntese objetiva do quadro atual e contexto da avaliação."
        value={content.summary ?? ""}
        onChange={(v) => setField("summary", v)}
        disabled={isFinalized}
        error={displayErrors.summary}
        rows={4}
      />
      <TextareaSection
        id="postural_findings"
        label="Achados posturais"
        placeholder="Descreva assimetrias, alinhamentos e desvios observados por vista."
        value={content.postural_findings ?? ""}
        onChange={(v) => setField("postural_findings", v)}
        disabled={isFinalized}
        error={displayErrors.postural_findings}
        rows={4}
      />
      <TextareaSection
        id="dynamic_findings"
        label="Achados dinâmicos"
        placeholder="Compensações, controle motor, amplitudes observadas em movimento."
        value={content.dynamic_findings ?? ""}
        onChange={(v) => setField("dynamic_findings", v)}
        disabled={isFinalized}
        error={displayErrors.dynamic_findings}
        rows={4}
      />
      <TextareaSection
        id="exercise_findings"
        label="Achados por exercício"
        placeholder="Comportamento durante exercícios específicos avaliados."
        value={content.exercise_findings ?? ""}
        onChange={(v) => setField("exercise_findings", v)}
        disabled={isFinalized}
        error={displayErrors.exercise_findings}
        rows={4}
      />
      <TextareaSection
        id="recommendations"
        label="Recomendações clínicas"
        placeholder="Sugestões de conduta, cuidados, contraindicações relativas."
        value={content.recommendations ?? ""}
        onChange={(v) => setField("recommendations", v)}
        disabled={isFinalized}
        error={displayErrors.recommendations}
        rows={4}
      />
      <TextareaSection
        id="plan"
        label="Plano de acompanhamento"
        placeholder="Frequência sugerida, reavaliações, marcos esperados."
        value={content.plan ?? ""}
        onChange={(v) => setField("plan", v)}
        disabled={isFinalized}
        error={displayErrors.plan}
        rows={4}
      />
      <TextareaSection
        id="professional_notes"
        label="Notas do profissional responsável"
        placeholder="Considerações clínicas adicionais do fisioterapeuta."
        value={content.professional_notes ?? ""}
        onChange={(v) => setField("professional_notes", v)}
        disabled={isFinalized}
        error={displayErrors.professional_notes}
        rows={3}
      />

      {hasMedia && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mídia clínica anexada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {posturalMedia.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Imagens posturais
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {posturalMedia.map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="text-xs text-muted-foreground">{p.view ?? "—"}</div>
                      <SignedClinicalMedia path={p.image_url} kind="image" alt={p.view ?? "vista"} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {movementMedia.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Vídeos de movimento
                </div>
                <div className="grid gap-4">
                  {movementMedia.map((m) => (
                    <div key={m.id} className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {m.movement_name ?? "Movimento"}
                      </div>
                      <SignedClinicalMedia path={m.video_url} kind="video" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card
        className={
          displayErrors.disclaimer_acknowledged
            ? "border-destructive"
            : "border-primary/30 bg-primary/5"
        }
        data-report-error={displayErrors.disclaimer_acknowledged ? "true" : undefined}
      >
        <CardHeader className="flex flex-row items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Disclaimer clínico</CardTitle>
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{REPORT_DISCLAIMER}</p>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={Boolean(content.disclaimer_acknowledged)}
              disabled={isFinalized}
              onCheckedChange={(v) => setField("disclaimer_acknowledged", v === true)}
              aria-invalid={Boolean(displayErrors.disclaimer_acknowledged)}
            />
            <span>
              Confirmo, como profissional responsável, que revisei os achados e assumo a
              responsabilidade clínica deste relatório.
            </span>
          </label>
          <FieldError message={displayErrors.disclaimer_acknowledged} />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur print:hidden">
        <div className="text-xs text-muted-foreground">
          {isFinalized ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> Relatório finalizado — edição bloqueada.
            </span>
          ) : missingCount === 0 ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> Pronto para finalizar.
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {missingCount} campo
              {missingCount === 1 ? "" : "s"} obrigatório{missingCount === 1 ? "" : "s"} pendente
              {missingCount === 1 ? "" : "s"}.
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving || finalizing || isFinalized}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar rascunho
          </Button>
          <Button
            variant="hero"
            onClick={handleFinalize}
            disabled={finalizing || isFinalized || !canFinalize}
            aria-disabled={!canFinalize}
            title={
              !canFinalize && !isFinalized
                ? "Preencha todos os campos obrigatórios para finalizar."
                : undefined
            }
          >
            {finalizing && <Loader2 className="h-4 w-4 animate-spin" />} Finalizar relatório
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  required,
  children,
  error,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <Label htmlFor={htmlFor} className={error ? "text-destructive" : undefined}>
      {children}
      {required && (
        <span className="ml-1 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="h-3 w-3" /> {message}
    </p>
  );
}

function TextareaSection({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  rows,
}: {
  id: ReportFieldKey;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  error?: string;
  rows: number;
}) {
  return (
    <Card
      className={error ? "border-destructive" : undefined}
      data-report-error={error ? "true" : undefined}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-1 text-base">
          {label}
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <FieldError message={error} />
      </CardContent>
    </Card>
  );
}
