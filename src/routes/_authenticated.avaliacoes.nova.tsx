import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, ClipboardPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useStudents } from "@/lib/studentsStore";
import { createAssessment, type AssessmentType } from "@/lib/assessmentsStore";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const searchSchema = z.object({ studentId: z.string().optional() });

export const Route = createFileRoute("/_authenticated/avaliacoes/nova")({
  component: NovaAvaliacaoPage,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Nova avaliação | PilatesVision" }] }),
});

const typeOptions: { value: AssessmentType; label: string; hint: string }[] = [
  { value: "postural", label: "Postural", hint: "Análise estática por vistas" },
  { value: "dynamic", label: "Dinâmica", hint: "Movimento e compensações" },
  { value: "exercise", label: "Por exercício", hint: "Execução em aparelhos" },
  { value: "complete", label: "Completa", hint: "Postural + dinâmica + exercícios" },
];

function NovaAvaliacaoPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user } = useAuth();
  const { clinicId, loading: profileLoading } = useProfile();
  const { students, loading: studentsLoading } = useStudents(clinicId);

  const [studentId, setStudentId] = useState(search.studentId ?? "");
  const [type, setType] = useState<AssessmentType>("postural");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [mainComplaint, setMainComplaint] = useState("");
  const [painScore, setPainScore] = useState(0);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return toast.error("Perfil sem clínica vinculada.");
    if (!studentId) return toast.error("Selecione um paciente.");
    setSubmitting(true);
    try {
      const created = await createAssessment({
        clinic_id: clinicId,
        student_id: studentId,
        professional_id: user?.id ?? null,
        type,
        title: title.trim() || null,
        objective: objective.trim() || null,
        main_complaint: mainComplaint.trim() || null,
        pain_score: painScore,
        pain_level: painScore,
        clinical_notes: clinicalNotes.trim() || null,
        status: "draft",
      });
      toast.success("Rascunho criado.");
      navigate({ to: "/avaliacoes/$id", params: { id: created.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link
            to="/avaliacoes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Avaliações
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <ClipboardPlus className="h-3.5 w-3.5" /> Ficha inicial
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Nova avaliação
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra os dados iniciais como rascunho. Achados posturais, dinâmicos e por exercício
            são adicionados na tela seguinte.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-6"
        >
          <div>
            <Label>Paciente *</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue
                  placeholder={studentsLoading ? "Carregando…" : "Selecione um paciente"}
                />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de avaliação *</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                    type === opt.value
                      ? "border-primary/70 bg-primary/10"
                      : "border-border/60 bg-card/30 hover:border-border"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Avaliação inicial"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="objective">Objetivo</Label>
            <Input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Reduzir dor lombar em 8 semanas"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="complaint">Queixa principal</Label>
            <Input
              id="complaint"
              value={mainComplaint}
              onChange={(e) => setMainComplaint(e.target.value)}
              placeholder="Dor lombar ao final do dia"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>
              Dor atual: <span className="text-primary">{painScore}/10</span>
            </Label>
            <Slider
              value={[painScore]}
              onValueChange={(v) => setPainScore(v[0])}
              min={0}
              max={10}
              step={1}
              className="mt-3"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações clínicas</Label>
            <Textarea
              id="notes"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <Link to="/avaliacoes">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="hero" disabled={submitting || profileLoading}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar rascunho
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
