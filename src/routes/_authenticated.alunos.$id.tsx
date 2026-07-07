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
import { archiveStudent, updateStudent, useStudent, type StudentStatus } from "@/lib/studentsStore";
import { useStudentAssessments } from "@/lib/assessmentsStore";
import { useStudentReports } from "@/lib/reportsStore";
import { toast } from "sonner";
import { ClipboardPlus, FileText, Plus } from "lucide-react";

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

const statusLabel: Record<StudentStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  archived: "Arquivado",
};

function AlunoDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { student, loading } = useStudent(id);
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
    status: "active" as StudentStatus,
  });

  useEffect(() => {
    if (!student) return;
    setForm({
      name: student.name,
      email: student.email ?? "",
      phone: student.phone ?? "",
      birth_date: student.birth_date ?? "",
      age: student.age != null ? String(student.age) : "",
      gender: (student.gender as "F" | "M" | "outro") ?? "F",
      main_goal: student.goals?.[0] ?? "",
      main_complaint: student.main_complaint ?? "",
      clinical_notes: student.clinical_notes ?? "",
      status: (student.status as StudentStatus) ?? "active",
    });
  }, [student]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
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

  const age = ageFrom(student.birth_date, student.age);
  const st = (student.status as StudentStatus) ?? "active";

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
      await updateStudent(student.id, {
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
      navigate({ to: "/alunos/$id", params: { id: student.id }, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    try {
      await archiveStudent(student.id);
      toast.success("Paciente arquivado.");
      navigate({ to: "/alunos" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao arquivar.");
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
            {student.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{student.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {age != null ? `${age} anos · ` : ""}
              {student.gender ?? "—"} · cadastrado em{" "}
              {new Date(student.created_at).toLocaleDateString("pt-BR")}
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
                  onValueChange={(v) => setForm({ ...form, status: v as StudentStatus })}
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
                    {student.email ?? "—"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {student.phone ?? "—"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {student.birth_date
                      ? new Date(student.birth_date).toLocaleDateString("pt-BR")
                      : "—"}
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Objetivo principal
                </div>
                <p className="mt-3 text-sm">{student.goals?.[0] ?? "—"}</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Queixa principal
                </div>
                <p className="mt-3 text-sm">{student.main_complaint ?? "—"}</p>
              </div>
            </div>

            {student.clinical_notes && (
              <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Observações clínicas
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {student.clinical_notes}
                </p>
              </div>
            )}

            <div className="mt-10">
              <AssessmentsHistory studentId={student.id} />
            </div>

            <div className="mt-10">
              <ReportsHistory studentId={student.id} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const asmtStatusLabel: Record<string, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  finalized: "Finalizada",
};
const asmtTypeLabel: Record<string, string> = {
  postural: "Postural",
  dynamic: "Dinâmica",
  exercise: "Por exercício",
  complete: "Completa",
};

function AssessmentsHistory({ studentId }: { studentId: string }) {
  const { assessments, loading } = useStudentAssessments(studentId);
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Avaliações</h2>
        <Link to="/avaliacoes/nova" search={{ studentId }}>
          <Button variant="hero" size="sm">
            <ClipboardPlus className="h-4 w-4" /> Nova avaliação
          </Button>
        </Link>
      </div>
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
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={a.status === "finalized" ? "default" : "secondary"}
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
                  <Button variant="ghost" size="sm" disabled title="Disponível em breve">
                    <FileText className="h-4 w-4" /> Gerar relatório
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
