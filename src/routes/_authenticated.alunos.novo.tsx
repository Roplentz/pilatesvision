import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStudent } from "@/lib/studentsStore";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alunos/novo")({
  component: NovoAlunoPage,
  head: () => ({
    meta: [{ title: "Novo aluno | PilatesVision" }],
  }),
});

function NovoAlunoPage() {
  const navigate = useNavigate();
  const { clinicId, loading: profileLoading } = useProfile();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"F" | "M" | "outro">("F");
  const [mainGoal, setMainGoal] = useState("");
  const [mainComplaint, setMainComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("E-mail inválido.");
      return;
    }
    if (!clinicId) {
      toast.error("Sua conta ainda não está vinculada a uma clínica.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createStudent({
        clinic_id: clinicId,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        birth_date: birthDate || null,
        age: age ? Number(age) : null,
        gender: sex,
        goals: mainGoal.trim() ? [mainGoal.trim()] : null,
        main_complaint: mainComplaint.trim() || null,
        clinical_notes: clinicalNotes.trim() || null,
        consent_given_at: consent ? new Date().toISOString() : null,
        created_by: user?.id ?? null,
        status: "active",
      });
      toast.success("Paciente cadastrado com sucesso.");
      navigate({ to: "/alunos/$id", params: { id: created.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar paciente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Pacientes
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <UserPlus className="h-3.5 w-3.5" /> Novo cadastro
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Cadastrar paciente
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Os dados são salvos na clínica vinculada ao seu perfil.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ana Beatriz Souza"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 ..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="birth">Data de nascimento</Label>
              <Input
                id="birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade (se não informar data)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Sexo</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as typeof sex)}>
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
          </div>

          <div>
            <Label htmlFor="goal">Objetivo principal</Label>
            <Input
              id="goal"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              placeholder="Melhorar postura"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="complaint">Queixa principal</Label>
            <Input
              id="complaint"
              value={mainComplaint}
              onChange={(e) => setMainComplaint(e.target.value)}
              placeholder="Dor lombar há 3 meses"
              className="mt-1.5"
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
              placeholder="Cirurgias, condições crônicas, restrições…"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-4">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
            />
            <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
              O paciente forneceu consentimento para uso dos dados clínicos e imagens para fins
              de avaliação e acompanhamento.
            </Label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <Link to="/alunos">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="hero" disabled={submitting || profileLoading}>
              {submitting ? "Salvando…" : "Cadastrar paciente"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
