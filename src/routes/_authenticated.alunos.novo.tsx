import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { addStudent } from "@/lib/studentsStore.mock";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alunos/novo")({
  component: NovoAlunoPage,
  head: () => ({
    meta: [{ title: "Novo aluno | PilatesVision" }],
  }),
});

function NovoAlunoPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"F" | "M" | "outro">("F");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goals, setGoals] = useState("");
  const [medical, setMedical] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) {
      toast.error("Nome e data de nascimento são obrigatórios.");
      return;
    }
    const created = addStudent({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      birthDate,
      gender,
      heightCm: Number(heightCm) || 0,
      weightKg: Number(weightKg) || 0,
      goals: goals
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      medicalHistory: medical.trim() || undefined,
    });
    toast.success("Aluno cadastrado com sucesso.");
    navigate({ to: "/alunos/$id", params: { id: created.id } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link
            to="/alunos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Alunos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <UserPlus className="h-3.5 w-3.5" /> Novo cadastro
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Cadastrar aluno
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Os dados ficam salvos apenas nesta sessão (mock local).
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
              <Label htmlFor="birth">Data de nascimento *</Label>
              <Input
                id="birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Gênero</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
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
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="goals">Objetivos (separados por vírgula)</Label>
            <Input
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Melhorar postura, Reduzir dor lombar"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="medical">Histórico clínico</Label>
            <Textarea
              id="medical"
              value={medical}
              onChange={(e) => setMedical(e.target.value)}
              rows={4}
              className="mt-1.5"
              placeholder="Cirurgias, condições crônicas, restrições…"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <Link to="/alunos">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="hero">
              Cadastrar aluno
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
