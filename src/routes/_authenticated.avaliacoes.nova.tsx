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
import { createAssessment } from "@/lib/assessmentsStore";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const searchSchema = z.object({ studentId: z.string().optional() });

export const Route = createFileRoute("/_authenticated/avaliacoes/nova")({
  component: NovaAvaliacaoPage,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Nova avaliação | PilatesVision" }] }),
});

function NovaAvaliacaoPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { clinicId, loading: profileLoading } = useProfile();
  const { students, loading: studentsLoading } = useStudents(clinicId);

  const [studentId, setStudentId] = useState(search.studentId ?? "");
  const [painLevel, setPainLevel] = useState(0);
  const [mainComplaint, setMainComplaint] = useState("");
  const [observations, setObservations] = useState("");
  const [goals, setGoals] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) {
      toast.error("Perfil sem clínica vinculada.");
      return;
    }
    if (!studentId) {
      toast.error("Selecione um aluno.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createAssessment({
        clinic_id: clinicId,
        student_id: studentId,
        pain_level: painLevel,
        main_complaint: mainComplaint.trim() || null,
        observations: observations.trim() || null,
        goals: goals
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      });
      toast.success("Avaliação criada.");
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
            <ClipboardPlus className="h-3.5 w-3.5" /> Ficha clínica
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Nova avaliação
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cria o registro inicial. As etapas postural e dinâmica acontecem na jornada guiada.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-6"
        >
          <div>
            <Label>Aluno *</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue
                  placeholder={studentsLoading ? "Carregando alunos…" : "Selecione um aluno"}
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
              Nível de dor: <span className="text-primary">{painLevel}/10</span>
            </Label>
            <Slider
              value={[painLevel]}
              onValueChange={(v) => setPainLevel(v[0])}
              min={0}
              max={10}
              step={1}
              className="mt-3"
            />
          </div>

          <div>
            <Label htmlFor="goals">Objetivos (separados por vírgula)</Label>
            <Input
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Reduzir dor lombar, Melhorar postura"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
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
              Criar avaliação
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
