import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  FileText,
  Loader2,
  Plus,
  Save,
  ScanLine,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicalMediaUploader } from "@/components/ClinicalMediaUploader";
import { SignedClinicalMedia } from "@/components/SignedClinicalMedia";
import { VideoPoseAnalyzer } from "@/components/VideoPoseAnalyzer";
import { isAutoMetricsSummary, type AutoMetricsSummary } from "@/lib/poseMetrics";
import { ExerciseCatalogPicker } from "@/components/ExerciseCatalogPicker";
import type { ExerciseCatalogItem } from "@/lib/exerciseCatalog";
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
import { toast } from "sonner";
import {
  finalizeAssessment,
  insertExerciseResult,
  insertMovementResult,
  insertPosturalResult,
  updateAssessment,
  useAssessment,
  useAssessmentResults,
  type AssessmentStatus,
  type AssessmentType,
  type ControlLevel,
  type ExerciseCompensation,
  type ExerciseResultRow,
  type MovementCompensation,
  type MovementResultRow,
  type PosturalFinding,
  type PosturalResultRow,
  type PosturalView,
  type Severity,
} from "@/lib/assessmentsStore";

export const Route = createFileRoute("/_authenticated/avaliacoes/$id")({
  component: AvaliacaoDetailPage,
  head: () => ({ meta: [{ title: "Avaliação | PilatesVision" }] }),
});

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  finalized: "Finalizada",
};
const typeLabel: Record<string, string> = {
  postural: "Postural",
  dynamic: "Dinâmica",
  exercise: "Por exercício",
  complete: "Completa",
};
const viewLabel: Record<string, string> = {
  anterior: "Vista anterior",
  posterior: "Vista posterior",
  right_lateral: "Lateral direita",
  left_lateral: "Lateral esquerda",
};
const severityTone: Record<Severity, string> = {
  leve: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  moderada: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  importante: "bg-red-500/15 text-red-300 border-red-500/30",
};

const FUNCTIONAL_MOVEMENTS = [
  "Agachamento",
  "Ponte",
  "Lunge",
  "Apoio unipodal",
  "Sentar e levantar",
  "Movimento livre",
] as const;

const PILATES_EXERCISES = [
  "Hundred",
  "Roll Up",
  "Single Leg Stretch",
  "Bridge",
  "Swan",
  "Side Kick",
  "Footwork no Reformer",
  "Squat no Reformer",
  "Exercício livre",
] as const;

const APPARATUS_OPTIONS = [
  "Solo",
  "Reformer",
  "Cadillac",
  "Chair",
  "Barrel",
  "Outro",
] as const;

function AvaliacaoDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { assessment, loading } = useAssessment(id);
  const { postural, movement, exercise, loading: extrasLoading, reload } = useAssessmentResults(id);

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    objective: "",
    main_complaint: "",
    pain_score: 0,
    clinical_notes: "",
  });

  useEffect(() => {
    if (!assessment) return;
    setForm({
      title: assessment.title ?? "",
      objective: assessment.objective ?? "",
      main_complaint: assessment.main_complaint ?? "",
      pain_score: assessment.pain_score ?? assessment.pain_level ?? 0,
      clinical_notes: assessment.clinical_notes ?? "",
    });
  }, [assessment]);

  if (loading || extrasLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Avaliação não encontrada.</p>
          <Link to="/avaliacoes" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = assessment.status as AssessmentStatus;
  const type = assessment.type as AssessmentType;
  const isDraft = status === "draft" || status === "in_review";
  const canFinalize = status !== "finalized";

  const showPostural = type === "postural" || type === "complete";
  const showMovement = type === "dynamic" || type === "complete";
  const showExercise = type === "exercise" || type === "complete";

  const saveHeader = async () => {
    setSaving(true);
    try {
      await updateAssessment(assessment.id, {
        title: form.title.trim() || null,
        objective: form.objective.trim() || null,
        main_complaint: form.main_complaint.trim() || null,
        pain_score: form.pain_score,
        pain_level: form.pain_score,
        clinical_notes: form.clinical_notes.trim() || null,
      });
      toast.success("Rascunho salvo.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    // Validação clínica prudente
    if (!form.main_complaint.trim() && !form.clinical_notes.trim()) {
      toast.error("Preencha ao menos a queixa principal ou as observações clínicas.");
      return;
    }
    const hasAny =
      (showPostural && postural.length > 0) ||
      (showMovement && movement.length > 0) ||
      (showExercise && exercise.length > 0);
    if (!hasAny) {
      toast.error("Registre ao menos um achado antes de finalizar.");
      return;
    }
    setFinalizing(true);
    try {
      // salva header primeiro
      await updateAssessment(assessment.id, {
        title: form.title.trim() || null,
        objective: form.objective.trim() || null,
        main_complaint: form.main_complaint.trim() || null,
        pain_score: form.pain_score,
        pain_level: form.pain_score,
        clinical_notes: form.clinical_notes.trim() || null,
      });
      await finalizeAssessment(assessment.id);
      toast.success("Avaliação finalizada.");
      navigate({ to: "/avaliacoes/$id", params: { id: assessment.id }, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar.");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/avaliacoes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Avaliações
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "finalized" ? "default" : "secondary"}
              className="text-[11px]"
            >
              {statusLabel[status] ?? status}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {typeLabel[type] ?? type}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" /> {assessment.students?.name ?? "Paciente"}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            {assessment.title || `Avaliação ${typeLabel[type] ?? ""}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Criada em {new Date(assessment.created_at).toLocaleString("pt-BR")}
            {assessment.finalized_at &&
              ` · Finalizada em ${new Date(assessment.finalized_at).toLocaleString("pt-BR")}`}
          </p>
          <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
            Registro clínico de apoio à decisão. Os achados descrevem observações e sugerem
            hipóteses — não constituem diagnóstico.
          </p>
        </section>

        {/* Ficha */}
        <section className="rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Ficha inicial</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                disabled={!isDraft}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Objetivo</Label>
              <Input
                value={form.objective}
                disabled={!isDraft}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Queixa principal</Label>
              <Input
                value={form.main_complaint}
                disabled={!isDraft}
                onChange={(e) => setForm({ ...form, main_complaint: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label>
                Dor atual: <span className="text-primary">{form.pain_score}/10</span>
              </Label>
              <Slider
                value={[form.pain_score]}
                disabled={!isDraft}
                onValueChange={(v) => setForm({ ...form, pain_score: v[0] })}
                min={0}
                max={10}
                step={1}
                className="mt-3"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Observações clínicas</Label>
              <Textarea
                value={form.clinical_notes}
                disabled={!isDraft}
                onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })}
                rows={4}
                className="mt-1.5"
              />
            </div>
          </div>
          {isDraft && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={saveHeader} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar ficha
              </Button>
            </div>
          )}
        </section>

        {/* Seções clínicas */}
        <Tabs defaultValue={showPostural ? "postural" : showMovement ? "movement" : "exercise"}>
          <TabsList>
            {showPostural && <TabsTrigger value="postural">Postural</TabsTrigger>}
            {showMovement && <TabsTrigger value="movement">Dinâmica</TabsTrigger>}
            {showExercise && <TabsTrigger value="exercise">Exercício</TabsTrigger>}
          </TabsList>

          {showPostural && (
            <TabsContent value="postural" className="mt-4">
              <PosturalSection
                assessmentId={assessment.id}
                clinicId={assessment.clinic_id}
                studentId={assessment.student_id}
                items={postural}
                editable={isDraft}
                onSaved={reload}
              />
            </TabsContent>
          )}
          {showMovement && (
            <TabsContent value="movement" className="mt-4">
              <MovementSection
                assessmentId={assessment.id}
                clinicId={assessment.clinic_id}
                studentId={assessment.student_id}
                items={movement}
                editable={isDraft}
                onSaved={reload}
              />
            </TabsContent>
          )}
          {showExercise && (
            <TabsContent value="exercise" className="mt-4">
              <ExerciseSection
                assessmentId={assessment.id}
                clinicId={assessment.clinic_id}
                studentId={assessment.student_id}
                items={exercise}
                editable={isDraft}
                onSaved={reload}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Ações */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="text-xs text-muted-foreground">
            {status === "finalized"
              ? "Avaliação finalizada — o registro é somente leitura."
              : "Enquanto rascunho, os campos e achados podem ser editados/adicionados."}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" disabled title="Disponível em breve">
              <FileText className="h-4 w-4" /> Gerar relatório
            </Button>
            {canFinalize && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="hero" size="sm" disabled={finalizing}>
                    {finalizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Finalizar avaliação
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalizar avaliação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Após finalizar, a avaliação não poderá mais ser editada. Registre agora
                      qualquer achado ou observação pendente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={finalize}>Finalizar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- POSTURAL ---------- */
function PosturalSection({
  assessmentId,
  clinicId,
  studentId,
  items,
  editable,
  onSaved,
}: {
  assessmentId: string;
  clinicId: string;
  studentId: string;
  items: PosturalResultRow[];
  editable: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PosturalView>("anterior");
  const [score, setScore] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [findings, setFindings] = useState<PosturalFinding[]>([]);
  const [region, setRegion] = useState("");
  const [finding, setFinding] = useState("");
  const [severity, setSeverity] = useState<Severity>("leve");
  const [findingNotes, setFindingNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const addFinding = () => {
    if (!region.trim() || !finding.trim()) {
      toast.error("Região e achado são obrigatórios.");
      return;
    }
    setFindings((f) => [
      ...f,
      {
        region: region.trim(),
        finding: finding.trim(),
        severity,
        notes: findingNotes.trim() || undefined,
      },
    ]);
    setRegion("");
    setFinding("");
    setSeverity("leve");
    setFindingNotes("");
  };

  const save = async () => {
    if (findings.length === 0) {
      toast.error("Adicione ao menos um achado.");
      return;
    }
    setSaving(true);
    try {
      await insertPosturalResult({
        assessment_id: assessmentId,
        clinic_id: clinicId,
        student_id: studentId,
        view,
        findings: findings as unknown as never,
        score: score ? Number(score) : null,
        professional_notes: notes.trim() || null,
        image_url: imagePath,
      });
      toast.success("Achado postural salvo.");
      setOpen(false);
      setView("anterior");
      setScore("");
      setNotes("");
      setFindings([]);
      setImagePath(null);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-primary" />
          <h3 className="font-display text-lg font-semibold">Achados posturais</h3>
        </div>
        {editable && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar vista
          </Button>
        )}
      </div>

      {items.length === 0 && !open && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
          Nenhuma vista registrada.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((r) => {
          const fs = Array.isArray(r.findings) ? (r.findings as unknown as PosturalFinding[]) : [];
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-center justify-between">
                <div className="font-medium">{viewLabel[r.view ?? ""] ?? r.view ?? "—"}</div>
                {r.score != null && (
                  <Badge variant="outline" className="text-[11px]">
                    Score {r.score}
                  </Badge>
                )}
              </div>
              {fs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {fs.map((f, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-2 text-sm">
                      <Badge
                        className={`border ${severityTone[f.severity] ?? ""}`}
                        variant="outline"
                      >
                        {f.severity}
                      </Badge>
                      <span className="font-medium">{f.region}:</span>
                      <span className="text-muted-foreground">{f.finding}</span>
                      {f.notes && (
                        <span className="basis-full pl-1 text-xs text-muted-foreground">
                          Nota: {f.notes}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {r.professional_notes && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Observação do profissional: {r.professional_notes}
                </p>
              )}
              {r.image_url && (
                <div className="mt-4">
                  <SignedClinicalMedia
                    path={r.image_url}
                    kind="image"
                    alt={`Imagem postural ${viewLabel[r.view ?? ""] ?? r.view ?? ""}`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editable && open && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Vista</Label>
              <Select value={view} onValueChange={(v) => setView(v as PosturalView)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anterior">Anterior</SelectItem>
                  <SelectItem value="posterior">Posterior</SelectItem>
                  <SelectItem value="right_lateral">Lateral direita</SelectItem>
                  <SelectItem value="left_lateral">Lateral esquerda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Score (opcional)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Novo achado</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Região (ex.: ombros)"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
              <Input
                placeholder="Achado (ex.: elevação D)"
                value={finding}
                onChange={(e) => setFinding(e.target.value)}
              />
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="importante">Importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Notas (opcional)"
              value={findingNotes}
              onChange={(e) => setFindingNotes(e.target.value)}
              className="mt-3"
            />
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={addFinding}>
                <Plus className="h-4 w-4" /> Adicionar achado
              </Button>
            </div>
          </div>

          {findings.length > 0 && (
            <ul className="space-y-1 text-sm">
              {findings.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className={severityTone[f.severity]}>
                    {f.severity}
                  </Badge>
                  <span className="font-medium">{f.region}:</span>
                  <span className="text-muted-foreground">{f.finding}</span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <Label>Observações do profissional</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5"
              placeholder="Descreva contexto, hipóteses e sugestões de suporte à decisão."
            />
          </div>

          <ClinicalMediaUploader
            kind="image"
            clinicId={clinicId}
            studentId={studentId}
            assessmentId={assessmentId}
            currentPath={imagePath}
            onUploaded={(p) => setImagePath(p)}
            onCleared={() => setImagePath(null)}
          />

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="hero" size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar vista
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- MOVEMENT ---------- */
function MovementSection({
  assessmentId,
  clinicId,
  studentId,
  items,
  editable,
  onSaved,
}: {
  assessmentId: string;
  clinicId: string;
  studentId: string;
  items: MovementResultRow[];
  editable: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [movementPreset, setMovementPreset] = useState<string>(FUNCTIONAL_MOVEMENTS[0]);
  const [movementCustom, setMovementCustom] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [compensations, setCompensations] = useState<MovementCompensation[]>([]);
  const [comp, setComp] = useState("");
  const [severity, setSeverity] = useState<Severity>("leve");
  const [compNotes, setCompNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const addComp = () => {
    if (!comp.trim()) return toast.error("Descreva a compensação.");
    setCompensations((c) => [
      ...c,
      { compensation: comp.trim(), severity, notes: compNotes.trim() || undefined },
    ]);
    setComp("");
    setSeverity("leve");
    setCompNotes("");
  };

  const save = async () => {
    const resolvedName =
      movementPreset === "Movimento livre"
        ? movementCustom.trim()
        : movementPreset.trim();
    if (!resolvedName) return toast.error("Informe o movimento avaliado.");
    setSaving(true);
    try {
      await insertMovementResult({
        assessment_id: assessmentId,
        clinic_id: clinicId,
        student_id: studentId,
        movement_name: resolvedName,
        compensations: compensations as unknown as never,
        controle: score ? Number(score) : null,
        professional_notes: notes.trim() || null,
        video_url: videoPath,
        image_url: imagePath,
      });
      toast.success("Avaliação dinâmica salva.");
      setOpen(false);
      setMovementPreset(FUNCTIONAL_MOVEMENTS[0]);
      setMovementCustom("");
      setScore("");
      setNotes("");
      setCompensations([]);
      setVideoPath(null);
      setImagePath(null);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-display text-lg font-semibold">
              Avaliação Dinâmica — triagem de movimentos funcionais
            </h3>
            <p className="text-xs text-muted-foreground">
              Triagem clínica de movimentos funcionais (fora do repertório Pilates).
              Estimativa/apoio à decisão — requer confirmação clínica.
            </p>
          </div>
        </div>
        {editable && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar movimento
          </Button>
        )}
      </div>

      {items.length === 0 && !open && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
          Nenhum movimento registrado.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((r) => {
          const cs = Array.isArray(r.compensations)
            ? (r.compensations as unknown as MovementCompensation[])
            : [];
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.movement_name ?? "—"}</div>
                {r.controle != null && (
                  <Badge variant="outline" className="text-[11px]">
                    Controle {r.controle}
                  </Badge>
                )}
              </div>
              {cs.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {cs.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-2">
                      <Badge
                        className={`border ${severityTone[c.severity] ?? ""}`}
                        variant="outline"
                      >
                        {c.severity}
                      </Badge>
                      <span className="text-muted-foreground">{c.compensation}</span>
                      {c.notes && (
                        <span className="basis-full pl-1 text-xs text-muted-foreground">
                          Nota: {c.notes}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {r.professional_notes && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Observação: {r.professional_notes}
                </p>
              )}
              {r.video_url && (
                <div className="mt-4">
                  <SignedClinicalMedia path={r.video_url} kind="video" />
                </div>
              )}
              {r.video_url && (
                <div className="mt-4">
                  <VideoPoseAnalyzer
                    resultId={r.id}
                    table="movement_results"
                    context="squat"
                    videoPath={r.video_url}
                    initialSummary={
                      isAutoMetricsSummary(r.metrics)
                        ? (r.metrics as unknown as AutoMetricsSummary)
                        : null
                    }
                    onSaved={onSaved}
                  />
                </div>
              )}
              {r.image_url && (
                <div className="mt-4">
                  <SignedClinicalMedia
                    path={r.image_url}
                    kind="image"
                    alt={`Foto de referência ${r.movement_name ?? ""}`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editable && open && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Movimento avaliado *</Label>
              <Select value={movementPreset} onValueChange={setMovementPreset}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTIONAL_MOVEMENTS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {movementPreset === "Movimento livre" && (
                <Input
                  value={movementCustom}
                  onChange={(e) => setMovementCustom(e.target.value)}
                  placeholder="Descreva o movimento avaliado"
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <Label>Controle motor (0-100, opcional)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Nova compensação
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Compensação observada"
                value={comp}
                onChange={(e) => setComp(e.target.value)}
              />
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="importante">Importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Notas (opcional)"
              value={compNotes}
              onChange={(e) => setCompNotes(e.target.value)}
              className="mt-3"
            />
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={addComp}>
                <Plus className="h-4 w-4" /> Adicionar compensação
              </Button>
            </div>
          </div>

          {compensations.length > 0 && (
            <ul className="space-y-1 text-sm">
              {compensations.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className={severityTone[c.severity]}>
                    {c.severity}
                  </Badge>
                  <span className="text-muted-foreground">{c.compensation}</span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <Label>Observações do profissional</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>

          <ClinicalMediaUploader
            kind="video"
            clinicId={clinicId}
            studentId={studentId}
            assessmentId={assessmentId}
            currentPath={videoPath}
            onUploaded={(p) => setVideoPath(p)}
            onCleared={() => setVideoPath(null)}
          />

          <ClinicalMediaUploader
            kind="image"
            clinicId={clinicId}
            studentId={studentId}
            assessmentId={assessmentId}
            currentPath={imagePath}
            onUploaded={(p) => setImagePath(p)}
            onCleared={() => setImagePath(null)}
            label="Foto de referência (opcional)"
          />

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="hero" size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar movimento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- EXERCISE ---------- */
function ExerciseSection({
  assessmentId,
  clinicId,
  studentId,
  items,
  editable,
  onSaved,
}: {
  assessmentId: string;
  clinicId: string;
  studentId: string;
  items: ExerciseResultRow[];
  editable: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [namePreset, setNamePreset] = useState<string>(PILATES_EXERCISES[0]);
  const [nameCustom, setNameCustom] = useState("");
  const [apparatus, setApparatus] = useState<string>(APPARATUS_OPTIONS[0]);
  const [execution, setExecution] = useState("");
  const [control, setControl] = useState<ControlLevel>("bom");
  const [recommendation, setRecommendation] = useState("");
  const [comps, setComps] = useState<ExerciseCompensation[]>([]);
  const [comp, setComp] = useState("");
  const [severity, setSeverity] = useState<Severity>("leve");
  const [saving, setSaving] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const addComp = () => {
    if (!comp.trim()) return;
    setComps((c) => [...c, { compensation: comp.trim(), severity }]);
    setComp("");
    setSeverity("leve");
  };

  const save = async () => {
    const resolvedName =
      namePreset === "Exercício livre" ? nameCustom.trim() : namePreset.trim();
    if (!resolvedName) return toast.error("Informe o exercício.");
    setSaving(true);
    try {
      await insertExerciseResult({
        assessment_id: assessmentId,
        clinic_id: clinicId,
        student_id: studentId,
        exercise_name: resolvedName,
        apparatus: apparatus || null,
        execution_notes: execution.trim() || null,
        control_level: control,
        recommendation: recommendation.trim() || null,
        compensations: comps as unknown as never,
        video_url: videoPath,
        image_url: imagePath,
      });
      toast.success("Registro de exercício salvo.");
      setOpen(false);
      setNamePreset(PILATES_EXERCISES[0]);
      setNameCustom("");
      setApparatus(APPARATUS_OPTIONS[0]);
      setExecution("");
      setControl("bom");
      setRecommendation("");
      setComps([]);
      setVideoPath(null);
      setImagePath(null);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-display text-lg font-semibold">
              Exercícios Pilates — avaliação da execução dos exercícios do método
            </h3>
            <p className="text-xs text-muted-foreground">
              Avaliação clínica da execução do repertório Pilates. Estimativa/apoio à
              decisão — requer confirmação clínica.
            </p>
          </div>
        </div>
        {editable && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar exercício
          </Button>
        )}
      </div>

      {items.length === 0 && !open && (
        <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
          Nenhum exercício registrado.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((r) => {
          const cs = Array.isArray(r.compensations)
            ? (r.compensations as unknown as ExerciseCompensation[])
            : [];
          return (
            <li key={r.id} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.exercise_name}</div>
                  {r.apparatus && (
                    <div className="text-xs text-muted-foreground">Aparelho: {r.apparatus}</div>
                  )}
                </div>
                {r.control_level && (
                  <Badge variant="outline" className="text-[11px]">
                    Controle: {r.control_level}
                  </Badge>
                )}
              </div>
              {r.execution_notes && (
                <p className="mt-3 text-sm text-muted-foreground">{r.execution_notes}</p>
              )}
              {cs.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {cs.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Badge variant="outline" className={severityTone[c.severity]}>
                        {c.severity}
                      </Badge>
                      <span className="text-muted-foreground">{c.compensation}</span>
                    </li>
                  ))}
                </ul>
              )}
              {r.recommendation && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Recomendação: {r.recommendation}
                </p>
              )}
              {r.video_url && (
                <div className="mt-4">
                  <SignedClinicalMedia path={r.video_url} kind="video" />
                </div>
              )}
              {r.video_url && (
                <div className="mt-4">
                  <VideoPoseAnalyzer
                    resultId={r.id}
                    table="exercise_results"
                    context="pilates"
                    videoPath={r.video_url}
                    initialSummary={
                      isAutoMetricsSummary(r.metrics)
                        ? (r.metrics as unknown as AutoMetricsSummary)
                        : null
                    }
                    onSaved={onSaved}
                  />
                </div>
              )}
              {r.image_url && (
                <div className="mt-4">
                  <SignedClinicalMedia
                    path={r.image_url}
                    kind="image"
                    alt={`Foto de referência ${r.exercise_name}`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {editable && open && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Exercício *</Label>
              <Select value={namePreset} onValueChange={setNamePreset}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PILATES_EXERCISES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {namePreset === "Exercício livre" && (
                <Input
                  value={nameCustom}
                  onChange={(e) => setNameCustom(e.target.value)}
                  placeholder="Nome do exercício"
                  className="mt-2"
                />
              )}
            </div>
            <div>
              <Label>Aparelho</Label>
              <Select value={apparatus} onValueChange={setApparatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPARATUS_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Execução observada</Label>
            <Textarea
              value={execution}
              onChange={(e) => setExecution(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Nível de controle</Label>
              <Select value={control} onValueChange={(v) => setControl(v as ControlLevel)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="excelente">Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recomendação</Label>
              <Input
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                placeholder="Sugestão de progressão/regressão"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Nova compensação
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Compensação"
                value={comp}
                onChange={(e) => setComp(e.target.value)}
              />
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="importante">Importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={addComp}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>

          {comps.length > 0 && (
            <ul className="space-y-1 text-sm">
              {comps.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className={severityTone[c.severity]}>
                    {c.severity}
                  </Badge>
                  <span className="text-muted-foreground">{c.compensation}</span>
                </li>
              ))}
            </ul>
          )}

          <ClinicalMediaUploader
            kind="video"
            clinicId={clinicId}
            studentId={studentId}
            assessmentId={assessmentId}
            currentPath={videoPath}
            onUploaded={(p) => setVideoPath(p)}
            onCleared={() => setVideoPath(null)}
          />

          <ClinicalMediaUploader
            kind="image"
            clinicId={clinicId}
            studentId={studentId}
            assessmentId={assessmentId}
            currentPath={imagePath}
            onUploaded={(p) => setImagePath(p)}
            onCleared={() => setImagePath(null)}
            label="Foto de referência (opcional)"
          />

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="hero" size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar exercício
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
