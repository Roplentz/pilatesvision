import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Video,
} from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/nova-avaliacao")({
  head: () => ({
    meta: [
      { title: "Nova avaliação — Kinetik" },
      { name: "description", content: "Jornada clínica guiada: ficha, postural, dinâmica, exercícios e relatório." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NovaAvaliacao,
});

type StepId = "ficha" | "postural" | "dinamica" | "exercicios" | "relatorio";

const STEPS: { id: StepId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ficha", label: "Ficha", icon: ClipboardList },
  { id: "postural", label: "Postural", icon: ScanLine },
  { id: "dinamica", label: "Dinâmica", icon: Video },
  { id: "exercicios", label: "Exercícios", icon: Target },
  { id: "relatorio", label: "Relatório", icon: FileText },
];

const ALUNOS = [
  { id: "1", name: "Mariana Souza", age: 34 },
  { id: "2", name: "Rafael Lima", age: 41 },
  { id: "3", name: "Beatriz Castro", age: 28 },
  { id: "4", name: "João Pedro Alves", age: 52 },
];

const OBJETIVOS = [
  "Melhora postural",
  "Reabilitação lombar",
  "Fortalecimento de core",
  "Performance esportiva",
  "Pós-parto",
  "Mobilidade geral",
];

type Ficha = {
  alunoId: string;
  objetivo: string;
  dor: number;
  observacoes: string;
};

type ViewKey = "anterior" | "lateral" | "posterior";
const VIEWS: { key: ViewKey; label: string; hint: string }[] = [
  { key: "anterior", label: "Vista anterior", hint: "Frente, braços ao lado do corpo." },
  { key: "lateral", label: "Vista lateral", hint: "Perfil esquerdo, olhar no horizonte." },
  { key: "posterior", label: "Vista posterior", hint: "Costas, calcanhares alinhados." },
];

const POSTURAL_RESULT = {
  score: 82,
  findings: [
    { label: "Anteriorização da cabeça", severity: "Leve", value: "+12°" },
    { label: "Elevação do ombro direito", severity: "Moderada", value: "+8 mm" },
    { label: "Báscula pélvica anterior", severity: "Leve", value: "+6°" },
    { label: "Joelho valgo bilateral", severity: "Discreta", value: "—" },
  ],
};

const MOVIMENTOS = [
  "Roll Up",
  "Hundred",
  "Single Leg Stretch",
  "Swan",
  "Footwork no reformer",
  "Agachamento livre",
];

const DINAMICA_RESULT = {
  controle: 78,
  estabilidade: 71,
  simetria: 88,
  amplitude: 64,
};

const EXERCICIOS = [
  { name: "Pelvic Curl", focus: "Mobilidade lombo-pélvica", series: "3 x 10" },
  { name: "Cat-Cow", focus: "Mobilidade torácica", series: "3 x 8" },
  { name: "Hundred (modificado)", focus: "Ativação de core", series: "3 x 50" },
  { name: "Bridge no reformer", focus: "Estabilidade pélvica", series: "3 x 12" },
  { name: "Side-lying leg lift", focus: "Glúteo médio", series: "3 x 15" },
  { name: "Swan prep", focus: "Extensores torácicos", series: "2 x 10" },
];

function NovaAvaliacao() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  const [ficha, setFicha] = useState<Ficha>({
    alunoId: "",
    objetivo: "",
    dor: 3,
    observacoes: "",
  });

  const [posturalDone, setPosturalDone] = useState<Record<ViewKey, boolean>>({
    anterior: false,
    lateral: false,
    posterior: false,
  });
  const [posturalAnalyzing, setPosturalAnalyzing] = useState(false);
  const [posturalAnalyzed, setPosturalAnalyzed] = useState(false);

  const [movimento, setMovimento] = useState("");
  const [dinAnalyzing, setDinAnalyzing] = useState(false);
  const [dinAnalyzed, setDinAnalyzed] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const aluno = ALUNOS.find((a) => a.id === ficha.alunoId);

  const canAdvance = () => {
    if (step.id === "ficha") return !!ficha.alunoId && !!ficha.objetivo;
    if (step.id === "postural") return posturalAnalyzed;
    if (step.id === "dinamica") return dinAnalyzed;
    if (step.id === "exercicios") return selectedExercises.length > 0;
    return true;
  };

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));

  const simulatePostural = () => {
    setPosturalAnalyzing(true);
    setTimeout(() => {
      setPosturalAnalyzing(false);
      setPosturalAnalyzed(true);
    }, 1500);
  };

  const simulateDinamica = () => {
    if (!movimento) return;
    setDinAnalyzing(true);
    setTimeout(() => {
      setDinAnalyzing(false);
      setDinAnalyzed(true);
    }, 1500);
  };

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <span className="text-xs text-muted-foreground">
            Etapa {stepIdx + 1} de {STEPS.length}
          </span>
        </div>

        <Stepper current={stepIdx} />

        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {step.id === "ficha" && (
                <FichaStep ficha={ficha} setFicha={setFicha} />
              )}
              {step.id === "postural" && (
                <PosturalStep
                  done={posturalDone}
                  setDone={setPosturalDone}
                  analyzing={posturalAnalyzing}
                  analyzed={posturalAnalyzed}
                  onAnalyze={simulatePostural}
                />
              )}
              {step.id === "dinamica" && (
                <DinamicaStep
                  movimento={movimento}
                  setMovimento={setMovimento}
                  analyzing={dinAnalyzing}
                  analyzed={dinAnalyzed}
                  onAnalyze={simulateDinamica}
                />
              )}
              {step.id === "exercicios" && (
                <ExerciciosStep
                  selected={selectedExercises}
                  toggle={toggleExercise}
                />
              )}
              {step.id === "relatorio" && (
                <RelatorioStep
                  aluno={aluno}
                  ficha={ficha}
                  movimento={movimento}
                  exercises={selectedExercises}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
          <Button variant="ghost" onClick={prev} disabled={stepIdx === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
          </Button>
          {stepIdx < STEPS.length - 1 ? (
            <Button variant="hero" onClick={next} disabled={!canAdvance()}>
              Próximo <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero">
              <FileText className="mr-1 h-4 w-4" /> Exportar PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Kinetik</span>
        </Link>
        <span className="text-sm text-muted-foreground">Nova avaliação</span>
      </div>
    </header>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={[
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                active && "border-primary/60 bg-primary/10 text-foreground shadow-glow",
                done && "border-primary/40 bg-primary/5 text-foreground",
                !active && !done && "border-border/60 bg-surface/50 text-muted-foreground",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "grid h-5 w-5 place-items-center rounded-full text-[10px]",
                  active && "bg-gradient-primary text-primary-foreground",
                  done && "bg-primary/30 text-primary",
                  !active && !done && "bg-background text-muted-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              </span>
              <span className="hidden font-medium sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border/60" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-gradient-surface p-8 shadow-elevated">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function FichaStep({ ficha, setFicha }: { ficha: Ficha; setFicha: (f: Ficha) => void }) {
  return (
    <StepCard title="Ficha do aluno" desc="Comece com os dados essenciais. Eles aparecem no relatório final.">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="aluno" className="text-xs font-medium text-muted-foreground">Aluno</Label>
          <Select value={ficha.alunoId} onValueChange={(v) => setFicha({ ...ficha, alunoId: v })}>
            <SelectTrigger id="aluno" className="h-11 bg-background/60">
              <SelectValue placeholder="Selecione o aluno" />
            </SelectTrigger>
            <SelectContent>
              {ALUNOS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} · {a.age} anos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objetivo" className="text-xs font-medium text-muted-foreground">Objetivo</Label>
          <Select value={ficha.objetivo} onValueChange={(v) => setFicha({ ...ficha, objetivo: v })}>
            <SelectTrigger id="objetivo" className="h-11 bg-background/60">
              <SelectValue placeholder="Defina o foco da avaliação" />
            </SelectTrigger>
            <SelectContent>
              {OBJETIVOS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Nível de dor (0–10)</Label>
            <span className="font-display text-2xl font-semibold text-foreground">{ficha.dor}</span>
          </div>
          <Slider
            value={[ficha.dor]}
            onValueChange={([v]) => setFicha({ ...ficha, dor: v })}
            min={0}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Sem dor</span>
            <span>Dor máxima</span>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="obs" className="text-xs font-medium text-muted-foreground">Observações</Label>
          <Textarea
            id="obs"
            rows={4}
            placeholder="Histórico clínico, lesões anteriores, restrições…"
            value={ficha.observacoes}
            onChange={(e) => setFicha({ ...ficha, observacoes: e.target.value })}
            className="bg-background/60"
          />
        </div>
      </div>
    </StepCard>
  );
}

function PosturalStep({
  done,
  setDone,
  analyzing,
  analyzed,
  onAnalyze,
}: {
  done: Record<ViewKey, boolean>;
  setDone: (d: Record<ViewKey, boolean>) => void;
  analyzing: boolean;
  analyzed: boolean;
  onAnalyze: () => void;
}) {
  const allCaptured = VIEWS.every((v) => done[v.key]);
  return (
    <StepCard title="Avaliação postural" desc="Capture as três vistas. A IA simulada analisa alinhamento e simetria.">
      <div className="grid gap-4 md:grid-cols-3">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setDone({ ...done, [v.key]: !done[v.key] })}
            className={[
              "group relative overflow-hidden rounded-xl border p-5 text-left transition",
              done[v.key]
                ? "border-primary/60 bg-primary/10"
                : "border-border/60 bg-surface/60 hover:border-primary/40",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/30">
                <Camera className="h-5 w-5" />
              </div>
              {done[v.key] && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </div>
            <h3 className="mt-4 font-display text-base font-semibold">{v.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{v.hint}</p>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
              {done[v.key] ? "Capturado" : "Toque para capturar"}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-4">
        <div className="text-sm text-muted-foreground">
          {allCaptured
            ? "Três vistas prontas. Rode a análise para gerar os achados."
            : "Capture as três vistas para liberar a análise."}
        </div>
        <Button variant="hero" onClick={onAnalyze} disabled={!allCaptured || analyzing}>
          {analyzing ? (
            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando…</>
          ) : (
            <><Sparkles className="mr-1 h-4 w-4" /> Analisar postura</>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {analyzed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 rounded-xl border border-border/60 bg-background/40 p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Score postural</p>
                <p className="mt-1 font-display text-4xl font-semibold text-gradient">
                  {POSTURAL_RESULT.score}
                  <span className="ml-1 text-xl text-muted-foreground">/100</span>
                </p>
              </div>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Bom</Badge>
            </div>
            <ul className="mt-6 grid gap-2 md:grid-cols-2">
              {POSTURAL_RESULT.findings.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/60 p-3 text-sm"
                >
                  <span className="text-foreground">{f.label}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{f.severity}</span>
                    <span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-foreground">{f.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </StepCard>
  );
}

function DinamicaStep({
  movimento,
  setMovimento,
  analyzing,
  analyzed,
  onAnalyze,
}: {
  movimento: string;
  setMovimento: (s: string) => void;
  analyzing: boolean;
  analyzed: boolean;
  onAnalyze: () => void;
}) {
  return (
    <StepCard title="Avaliação dinâmica" desc="Escolha um movimento. A análise mockada devolve quatro métricas-chave.">
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Movimento</Label>
          <Select value={movimento} onValueChange={setMovimento}>
            <SelectTrigger className="h-11 bg-background/60">
              <SelectValue placeholder="Selecione o movimento avaliado" />
            </SelectTrigger>
            <SelectContent>
              {MOVIMENTOS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="hero" onClick={onAnalyze} disabled={!movimento || analyzing} className="w-full md:w-auto">
            {analyzing ? (
              <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando…</>
            ) : (
              <><Sparkles className="mr-1 h-4 w-4" /> Analisar movimento</>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {analyzed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Metric label="Controle" value={DINAMICA_RESULT.controle} />
            <Metric label="Estabilidade" value={DINAMICA_RESULT.estabilidade} />
            <Metric label="Simetria" value={DINAMICA_RESULT.simetria} />
            <Metric label="Amplitude" value={DINAMICA_RESULT.amplitude} />
          </motion.div>
        )}
      </AnimatePresence>
    </StepCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <TrendingUp className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-primary"
        />
      </div>
    </div>
  );
}

function ExerciciosStep({
  selected,
  toggle,
}: {
  selected: string[];
  toggle: (s: string) => void;
}) {
  return (
    <StepCard title="Exercícios recomendados" desc="Selecione os exercícios que entram no plano do aluno.">
      <ul className="grid gap-3">
        {EXERCICIOS.map((ex) => {
          const isSelected = selected.includes(ex.name);
          return (
            <li
              key={ex.name}
              className={[
                "flex items-center justify-between gap-4 rounded-xl border p-4 transition",
                isSelected ? "border-primary/60 bg-primary/10" : "border-border/60 bg-surface/60",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-background/60 text-primary ring-1 ring-primary/20">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">{ex.focus} · {ex.series}</div>
                </div>
              </div>
              <Button variant={isSelected ? "outline" : "hero"} size="sm" onClick={() => toggle(ex.name)}>
                {isSelected ? (<><Check className="mr-1 h-4 w-4" /> Adicionado</>) : (<><Plus className="mr-1 h-4 w-4" /> Adicionar</>)}
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        {selected.length} exercício{selected.length === 1 ? "" : "s"} no relatório.
      </p>
    </StepCard>
  );
}

function RelatorioStep({
  aluno,
  ficha,
  movimento,
  exercises,
}: {
  aluno: { name: string; age: number } | undefined;
  ficha: Ficha;
  movimento: string;
  exercises: string[];
}) {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-surface shadow-elevated">
      <div className="relative border-b border-border/60 p-8">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-60" />
        <div className="relative flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Relatório clínico</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{aluno?.name ?? "Aluno"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {aluno ? `${aluno.age} anos · ` : ""}{ficha.objetivo || "Objetivo a definir"} · {today}
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border/60 md:grid-cols-3">
        <SummaryStat label="Score postural" value={`${POSTURAL_RESULT.score}/100`} icon={ScanLine} />
        <SummaryStat label="Nível de dor" value={`${ficha.dor}/10`} icon={User} />
        <SummaryStat label="Exercícios" value={`${exercises.length}`} icon={Target} />
      </div>

      <div className="grid gap-px bg-border/60 md:grid-cols-2">
        <div className="bg-surface p-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Achados posturais</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {POSTURAL_RESULT.findings.map((f) => (
              <li key={f.label} className="flex items-center justify-between">
                <span>{f.label}</span>
                <span className="text-muted-foreground">{f.severity}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface p-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Avaliação dinâmica</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Movimento: <span className="text-foreground">{movimento || "—"}</span>
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <li className="flex justify-between"><span>Controle</span><span className="font-mono">{DINAMICA_RESULT.controle}</span></li>
            <li className="flex justify-between"><span>Estabilidade</span><span className="font-mono">{DINAMICA_RESULT.estabilidade}</span></li>
            <li className="flex justify-between"><span>Simetria</span><span className="font-mono">{DINAMICA_RESULT.simetria}</span></li>
            <li className="flex justify-between"><span>Amplitude</span><span className="font-mono">{DINAMICA_RESULT.amplitude}</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 bg-surface p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Plano de exercícios</h3>
        {exercises.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum exercício selecionado.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {exercises.map((name) => {
              const ex = EXERCICIOS.find((e) => e.name === name);
              return (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3 text-sm"
                >
                  <span>{name}</span>
                  <span className="text-xs text-muted-foreground">{ex?.series}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {ficha.observacoes && (
        <div className="border-t border-border/60 bg-surface p-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Observações</h3>
          <p className="mt-3 text-sm text-muted-foreground">{ficha.observacoes}</p>
        </div>
      )}
    </section>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between bg-surface p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      </div>
      <Icon className="h-5 w-5 text-primary" />
    </div>
  );
}