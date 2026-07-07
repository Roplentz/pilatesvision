import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Plus,
  Printer,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  finalizeReport,
  REPORT_DISCLAIMER,
  toReportContent,
  updateReport,
  useReport,
  type ReportContent,
  type ReportExerciseFinding,
  type ReportMovementFinding,
  type ReportPosturalFinding,
} from "@/lib/reportsStore";

export const Route = createFileRoute("/_authenticated/relatorios/$id")({
  head: () => ({ meta: [{ title: "Relatório | PilatesVision" }] }),
  component: RelatorioDetailPage,
});

const severityTone: Record<string, string> = {
  leve: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  moderada: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  importante: "bg-red-500/15 text-red-300 border-red-500/30",
};

function RelatorioDetailPage() {
  const { id } = Route.useParams();
  const { report, loading, reload } = useReport(id);
  const [content, setContent] = useState<ReportContent | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!report) return;
    setContent(toReportContent(report.content));
    setTitle(report.title ?? "Relatório");
    setUnlocked(false);
  }, [report]);

  if (loading || !report || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const status = report.status;
  const isFinalized = status === "finalized";
  const editable = !isFinalized || unlocked;

  const patchContent = (patch: Partial<ReportContent>) =>
    setContent((c) => (c ? { ...c, ...patch } : c));

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await updateReport(report.id, {
        title: title.trim() || "Relatório",
        content: { ...content, disclaimer: REPORT_DISCLAIMER } as unknown as never,
      });
      toast.success("Rascunho salvo.");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    if (!content) return;
    if (!content.summary.text.trim()) {
      toast.error("Preencha o resumo clínico antes de finalizar.");
      return;
    }
    if (
      content.postural_findings.length === 0 &&
      content.movement_findings.length === 0 &&
      content.exercise_findings.length === 0
    ) {
      toast.error("Inclua ao menos um achado no relatório.");
      return;
    }
    setFinalizing(true);
    try {
      await finalizeReport(report.id, { ...content, disclaimer: REPORT_DISCLAIMER }, title.trim() || "Relatório");
      toast.success("Relatório finalizado.");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar.");
    } finally {
      setFinalizing(false);
    }
  };

  const printPdf = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PrintStyles />
      <header className="border-b border-border/60 bg-card/30 backdrop-blur no-print">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            to="/relatorios"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Relatórios
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant={isFinalized ? "default" : "secondary"} className="text-[11px]">
              {isFinalized ? "Finalizado" : status === "archived" ? "Arquivado" : "Rascunho"}
            </Badge>
            <Badge variant="outline" className="text-[11px]">v{report.version}</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <section className="rounded-xl border border-border/60 bg-card/40 p-5 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Título</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!editable}
                className="mt-1 min-w-[280px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isFinalized && !unlocked && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4" /> Reabrir para edição
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reabrir relatório finalizado?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você poderá editar o conteúdo. Salve e finalize novamente para bloquear.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setUnlocked(true)}>
                        Reabrir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" size="sm" onClick={printPdf}>
                <Printer className="h-4 w-4" /> Exportar PDF
              </Button>
              {editable && (
                <>
                  <Button variant="outline" size="sm" onClick={save} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar rascunho
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="hero" size="sm" disabled={finalizing}>
                        {finalizing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Finalizar relatório
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Finalizar relatório?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Após finalizar, o relatório fica bloqueado. Você poderá reabrir para
                          novas edições se necessário.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={finalize}>Finalizar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Preview / documento */}
        <article id="report-doc" className="rounded-xl border border-border/60 bg-white text-slate-900 shadow-sm print:border-0 print:shadow-none">
          <div className="space-y-8 p-10 print:p-0">
            {/* Cabeçalho */}
            <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Clínica</div>
                <h1 className="mt-1 text-2xl font-semibold">{content.clinic.name || "—"}</h1>
                <div className="mt-1 text-sm text-slate-600">
                  {[content.clinic.city, content.clinic.state].filter(Boolean).join(" · ") || "—"}
                </div>
                {content.clinic.responsible && (
                  <div className="text-sm text-slate-600">
                    Responsável: {content.clinic.responsible}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-slate-500">Relatório</div>
                <div className="mt-1 text-lg font-medium">{title || "Relatório"}</div>
                <div className="text-xs text-slate-500">
                  Emitido em{" "}
                  {new Date(report.finalized_at ?? report.created_at).toLocaleDateString("pt-BR")}
                </div>
                <div className="text-xs text-slate-500">Versão {report.version}</div>
              </div>
            </header>

            {/* Paciente + avaliação */}
            <section className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Paciente</div>
                <div className="mt-1 text-lg font-medium">{content.student.name || "—"}</div>
                <div className="text-sm text-slate-600">
                  {[
                    content.student.age != null ? `${content.student.age} anos` : null,
                    content.student.sex,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Avaliação</div>
                <div className="mt-1 text-sm">
                  <div>
                    <span className="text-slate-500">Data:</span>{" "}
                    {new Date(content.assessment.date).toLocaleDateString("pt-BR")}
                  </div>
                  <div>
                    <span className="text-slate-500">Tipo:</span> {content.assessment.type}
                  </div>
                  {content.assessment.objective && (
                    <div>
                      <span className="text-slate-500">Objetivo:</span>{" "}
                      {content.assessment.objective}
                    </div>
                  )}
                  {content.assessment.main_complaint && (
                    <div>
                      <span className="text-slate-500">Queixa principal:</span>{" "}
                      {content.assessment.main_complaint}
                    </div>
                  )}
                  {content.assessment.pain_score != null && (
                    <div>
                      <span className="text-slate-500">Dor:</span>{" "}
                      {content.assessment.pain_score}/10
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Resumo */}
            <SectionBlock title={content.summary.title}>
              {editable ? (
                <>
                  <Input
                    value={content.summary.title}
                    className="mb-2"
                    onChange={(e) =>
                      patchContent({ summary: { ...content.summary, title: e.target.value } })
                    }
                  />
                  <Textarea
                    rows={5}
                    value={content.summary.text}
                    onChange={(e) =>
                      patchContent({ summary: { ...content.summary, text: e.target.value } })
                    }
                  />
                </>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content.summary.text || "—"}
                </p>
              )}
            </SectionBlock>

            {/* Achados posturais */}
            <FindingsBlock
              title="Achados posturais"
              items={content.postural_findings}
              editable={editable}
              renderRow={(f) => (
                <>
                  <FindingBadge severity={f.severity} />
                  <span className="font-medium">{f.view}</span>
                  <span>·</span>
                  <span className="font-medium">{f.region}</span>
                  <span className="text-slate-600">— {f.finding}</span>
                </>
              )}
              renderNotes={(f) => f.notes}
              onRemove={(idx) =>
                patchContent({
                  postural_findings: content.postural_findings.filter((_, i) => i !== idx),
                })
              }
              onAdd={() =>
                patchContent({
                  postural_findings: [
                    ...content.postural_findings,
                    { view: "anterior", region: "", finding: "", severity: "leve" },
                  ],
                })
              }
              renderEditor={(f, idx) => (
                <PosturalEditor
                  value={f}
                  onChange={(v) =>
                    patchContent({
                      postural_findings: content.postural_findings.map((x, i) => (i === idx ? v : x)),
                    })
                  }
                />
              )}
            />

            {/* Achados dinâmicos */}
            <FindingsBlock
              title="Achados dinâmicos"
              items={content.movement_findings}
              editable={editable}
              renderRow={(f) => (
                <>
                  <FindingBadge severity={f.severity} />
                  <span className="font-medium">{f.movement}</span>
                  <span className="text-slate-600">— {f.compensation}</span>
                </>
              )}
              renderNotes={(f) => f.notes}
              onRemove={(idx) =>
                patchContent({
                  movement_findings: content.movement_findings.filter((_, i) => i !== idx),
                })
              }
              onAdd={() =>
                patchContent({
                  movement_findings: [
                    ...content.movement_findings,
                    { movement: "", compensation: "", severity: "leve" },
                  ],
                })
              }
              renderEditor={(f, idx) => (
                <MovementEditor
                  value={f}
                  onChange={(v) =>
                    patchContent({
                      movement_findings: content.movement_findings.map((x, i) => (i === idx ? v : x)),
                    })
                  }
                />
              )}
            />

            {/* Achados por exercício */}
            <FindingsBlock
              title="Achados por exercício"
              items={content.exercise_findings}
              editable={editable}
              renderRow={(f) => (
                <>
                  <FindingBadge severity={f.severity} />
                  <span className="font-medium">{f.exercise}</span>
                  {f.apparatus && <span className="text-slate-500">({f.apparatus})</span>}
                  <span className="text-slate-600">— {f.compensation}</span>
                </>
              )}
              renderNotes={(f) => f.notes}
              onRemove={(idx) =>
                patchContent({
                  exercise_findings: content.exercise_findings.filter((_, i) => i !== idx),
                })
              }
              onAdd={() =>
                patchContent({
                  exercise_findings: [
                    ...content.exercise_findings,
                    { exercise: "", apparatus: "", compensation: "", severity: "leve" },
                  ],
                })
              }
              renderEditor={(f, idx) => (
                <ExerciseEditor
                  value={f}
                  onChange={(v) =>
                    patchContent({
                      exercise_findings: content.exercise_findings.map((x, i) => (i === idx ? v : x)),
                    })
                  }
                />
              )}
            />

            {/* Recomendações */}
            <SectionBlock title="Recomendações">
              {editable ? (
                <div className="space-y-2">
                  {content.recommendations.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={r}
                        onChange={(e) =>
                          patchContent({
                            recommendations: content.recommendations.map((x, j) =>
                              j === i ? e.target.value : x,
                            ),
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          patchContent({
                            recommendations: content.recommendations.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patchContent({ recommendations: [...content.recommendations, ""] })
                    }
                  >
                    <Plus className="h-4 w-4" /> Adicionar recomendação
                  </Button>
                </div>
              ) : content.recommendations.filter((r) => r.trim()).length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {content.recommendations
                    .filter((r) => r.trim())
                    .map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nenhuma recomendação registrada.</p>
              )}
            </SectionBlock>

            {/* Plano inicial */}
            <SectionBlock title="Plano inicial">
              {editable ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label className="text-slate-700">Frequência</Label>
                    <Input
                      value={content.plan.frequency}
                      onChange={(e) =>
                        patchContent({ plan: { ...content.plan, frequency: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">Foco</Label>
                    <Input
                      value={content.plan.focus}
                      onChange={(e) =>
                        patchContent({ plan: { ...content.plan, focus: e.target.value } })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">Duração estimada</Label>
                    <Input
                      value={content.plan.duration}
                      onChange={(e) =>
                        patchContent({ plan: { ...content.plan, duration: e.target.value } })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 text-sm md:grid-cols-3">
                  <PlanCell label="Frequência" value={content.plan.frequency} />
                  <PlanCell label="Foco" value={content.plan.focus} />
                  <PlanCell label="Duração" value={content.plan.duration} />
                </div>
              )}
            </SectionBlock>

            {/* Observações */}
            <SectionBlock title="Observações do profissional">
              {editable ? (
                <Textarea
                  rows={4}
                  value={content.professional_notes}
                  onChange={(e) => patchContent({ professional_notes: e.target.value })}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {content.professional_notes || "—"}
                </p>
              )}
            </SectionBlock>

            {/* Disclaimer */}
            <footer className="border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-600">
              <div className="mb-1 flex items-center gap-2 font-semibold text-slate-700">
                <FileText className="h-3.5 w-3.5" /> Aviso clínico
              </div>
              {REPORT_DISCLAIMER}
            </footer>
          </div>
        </article>
      </main>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">{title}</div>
      {children}
    </section>
  );
}

function PlanCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-1 text-sm">{value || "—"}</div>
    </div>
  );
}

function FindingBadge({ severity }: { severity: string }) {
  const cls =
    severityTone[severity] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide print:bg-white print:text-slate-700 ${cls}`}>
      {severity}
    </span>
  );
}

function FindingsBlock<T>({
  title,
  items,
  editable,
  onAdd,
  onRemove,
  renderRow,
  renderEditor,
  renderNotes,
}: {
  title: string;
  items: T[];
  editable: boolean;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  renderRow: (item: T) => React.ReactNode;
  renderEditor: (item: T, idx: number) => React.ReactNode;
  renderNotes?: (item: T) => string | undefined;
}) {
  return (
    <SectionBlock title={title}>
      {items.length === 0 && !editable && (
        <p className="text-sm text-slate-500">Nenhum achado registrado.</p>
      )}
      <ul className="space-y-2">
        {items.map((f, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {editable ? (
              <div className="space-y-2">
                {renderEditor(f, i)}
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onRemove(i)}>
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">{renderRow(f)}</div>
                {renderNotes && renderNotes(f) && (
                  <p className="mt-1 text-xs text-slate-500">Nota: {renderNotes(f)}</p>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      )}
    </SectionBlock>
  );
}

function PosturalEditor({
  value,
  onChange,
}: {
  value: ReportPosturalFinding;
  onChange: (v: ReportPosturalFinding) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <Input
        placeholder="Vista"
        value={value.view}
        onChange={(e) => onChange({ ...value, view: e.target.value })}
      />
      <Input
        placeholder="Região"
        value={value.region}
        onChange={(e) => onChange({ ...value, region: e.target.value })}
      />
      <Input
        placeholder="Achado"
        value={value.finding}
        onChange={(e) => onChange({ ...value, finding: e.target.value })}
      />
      <SeveritySelect
        value={value.severity}
        onChange={(s) => onChange({ ...value, severity: s })}
      />
      <Input
        placeholder="Notas (opcional)"
        className="md:col-span-4"
        value={value.notes ?? ""}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />
    </div>
  );
}
function MovementEditor({
  value,
  onChange,
}: {
  value: ReportMovementFinding;
  onChange: (v: ReportMovementFinding) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      <Input
        placeholder="Movimento"
        value={value.movement}
        onChange={(e) => onChange({ ...value, movement: e.target.value })}
      />
      <Input
        placeholder="Compensação"
        value={value.compensation}
        onChange={(e) => onChange({ ...value, compensation: e.target.value })}
      />
      <SeveritySelect
        value={value.severity}
        onChange={(s) => onChange({ ...value, severity: s })}
      />
      <Input
        placeholder="Notas (opcional)"
        className="md:col-span-3"
        value={value.notes ?? ""}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />
    </div>
  );
}
function ExerciseEditor({
  value,
  onChange,
}: {
  value: ReportExerciseFinding;
  onChange: (v: ReportExerciseFinding) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <Input
        placeholder="Exercício"
        value={value.exercise}
        onChange={(e) => onChange({ ...value, exercise: e.target.value })}
      />
      <Input
        placeholder="Aparelho"
        value={value.apparatus ?? ""}
        onChange={(e) => onChange({ ...value, apparatus: e.target.value })}
      />
      <Input
        placeholder="Compensação"
        value={value.compensation}
        onChange={(e) => onChange({ ...value, compensation: e.target.value })}
      />
      <SeveritySelect
        value={value.severity}
        onChange={(s) => onChange({ ...value, severity: s })}
      />
      <Input
        placeholder="Notas (opcional)"
        className="md:col-span-4"
        value={value.notes ?? ""}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />
    </div>
  );
}
function SeveritySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900"
    >
      <option value="leve">Leve</option>
      <option value="moderada">Moderada</option>
      <option value="importante">Importante</option>
    </select>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body { background: white !important; }
        .no-print { display: none !important; }
        #report-doc { border: 0 !important; box-shadow: none !important; }
        header, nav, aside { }
      }
    `}</style>
  );
}