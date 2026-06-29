import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  Filter,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/exercicios")({
  component: ExerciciosPage,
  head: () => ({
    meta: [
      { title: "Exercícios Pilates | Kinetik" },
      {
        name: "description",
        content:
          "Biblioteca visual de exercícios Pilates com critérios de qualidade, compensações comuns e feedback automatizado por IA.",
      },
    ],
  }),
});

type Categoria = "Mat" | "Reformer" | "Funcional" | "Alongamento";
type Nivel = "Iniciante" | "Intermediário" | "Avançado";
type Objetivo =
  | "Core"
  | "Mobilidade"
  | "Estabilidade"
  | "Força"
  | "Postura"
  | "Equilíbrio";
type Vista = "Lateral" | "Frontal" | "Posterior" | "Superior";

interface Exercise {
  id: string;
  nome: string;
  categoria: Categoria;
  nivel: Nivel;
  objetivo: Objetivo;
  vista: Vista;
  descricao: string;
  articulacoes: string[];
  criterios: string[];
  compensacoes: string[];
  feedback: string[];
}

const EXERCISES: Exercise[] = [
  {
    id: "hundred",
    nome: "Hundred",
    categoria: "Mat",
    nivel: "Intermediário",
    objetivo: "Core",
    vista: "Lateral",
    descricao:
      "Exercício clássico de ativação do powerhouse. Em decúbito dorsal, eleva-se o tronco e as pernas em tabletop, realizando bombeamento dos braços com respiração coordenada (5 inspirações + 5 expirações × 10).",
    articulacoes: ["Coluna cervical", "Coluna torácica", "Coxofemoral", "Ombros"],
    criterios: [
      "Cabeça alinhada com tronco (sem queixo projetado)",
      "Escápulas estabilizadas e afastadas das orelhas",
      "Pelve em retroversão neutra mantida",
      "Respiração ativa e contínua",
    ],
    compensacoes: [
      "Hiperextensão cervical",
      "Elevação dos ombros",
      "Lombar arqueada do solo",
      "Apneia respiratória",
    ],
    feedback: [
      "Detectado ganho de 12° de flexão torácica controlada",
      "Cervical estável durante 87% da execução",
      "Atenção: leve elevação do trapézio superior aos 30s",
    ],
  },
  {
    id: "roll-up",
    nome: "Roll Up",
    categoria: "Mat",
    nivel: "Intermediário",
    objetivo: "Mobilidade",
    vista: "Lateral",
    descricao:
      "Articulação vértebra por vértebra da coluna a partir do decúbito dorsal até a flexão sentada, retornando com o mesmo controle. Trabalha mobilidade segmentar e controle excêntrico do core.",
    articulacoes: ["Coluna lombar", "Coluna torácica", "Coxofemoral"],
    criterios: [
      "Sequenciamento vertebral contínuo",
      "Pés ancorados sem tensão",
      "Braços alinhados com ombros",
      "Ritmo constante na subida e descida",
    ],
    compensacoes: [
      "Impulso com pescoço/ombros",
      "Salto em bloco da lombar",
      "Pés saindo do solo",
      "Inversão do padrão respiratório",
    ],
    feedback: [
      "Mobilidade lombar dentro da faixa funcional",
      "Padrão de descida segmentado em 4 fases consistentes",
      "Sugestão: reduzir velocidade na transição T8–T12",
    ],
  },
  {
    id: "single-leg-stretch",
    nome: "Single Leg Stretch",
    categoria: "Mat",
    nivel: "Iniciante",
    objetivo: "Core",
    vista: "Superior",
    descricao:
      "Em decúbito dorsal com tronco fletido, alterna a flexão de uma perna ao peito enquanto a outra se estende. Foco em dissociação coxofemoral e estabilidade pélvica.",
    articulacoes: ["Coxofemoral", "Joelho", "Coluna lombar"],
    criterios: [
      "Pelve neutra durante a alternância",
      "Tronco estável sem rotações",
      "Cabeça apoiada nas mãos sem tração",
      "Coordenação respiratória 2 tempos",
    ],
    compensacoes: [
      "Báscula pélvica a cada troca",
      "Tensão cervical excessiva",
      "Joelho da perna estendida bloqueado",
    ],
    feedback: [
      "Simetria entre lados D/E: 94%",
      "Estabilidade pélvica acima da média",
    ],
  },
  {
    id: "shoulder-bridge",
    nome: "Shoulder Bridge",
    categoria: "Mat",
    nivel: "Iniciante",
    objetivo: "Estabilidade",
    vista: "Lateral",
    descricao:
      "Ponte com elevação pélvica articulada, ativando glúteos, isquiotibiais e core posterior. Trabalha extensão de quadril sem hiperextensão lombar.",
    articulacoes: ["Coxofemoral", "Coluna lombar", "Joelho"],
    criterios: [
      "Linha ombro–quadril–joelho",
      "Glúteos como principal motor",
      "Pés alinhados à largura do quadril",
      "Cervical relaxada",
    ],
    compensacoes: [
      "Hiperextensão lombar",
      "Joelhos em valgo",
      "Sobrecarga cervical",
      "Ativação predominante de isquiotibiais",
    ],
    feedback: [
      "Ativação glútea evidente",
      "Alinhamento joelho-quadril mantido em 92% do movimento",
    ],
  },
  {
    id: "swan",
    nome: "Swan",
    categoria: "Mat",
    nivel: "Intermediário",
    objetivo: "Postura",
    vista: "Lateral",
    descricao:
      "Extensão da coluna em decúbito ventral, promovendo abertura torácica e ativação dos extensores. Essencial para contrapor padrões cifóticos.",
    articulacoes: ["Coluna torácica", "Coluna lombar", "Ombros"],
    criterios: [
      "Extensão distribuída ao longo da coluna",
      "Escápulas em depressão e adução",
      "Cervical em continuidade com a torácica",
      "Pubis em contato com o solo",
    ],
    compensacoes: [
      "Extensão concentrada na lombar",
      "Elevação dos ombros",
      "Hiperextensão cervical",
    ],
    feedback: [
      "Distribuição da extensão melhorada vs. baseline",
      "Atenção: ainda há predominância lombar (~38%)",
    ],
  },
  {
    id: "swimming",
    nome: "Swimming",
    categoria: "Mat",
    nivel: "Avançado",
    objetivo: "Estabilidade",
    vista: "Superior",
    descricao:
      "Em decúbito ventral, alternar a elevação de braço e perna contralaterais em ritmo dinâmico, mantendo o core estabilizado e a coluna alongada.",
    articulacoes: ["Coxofemoral", "Ombro", "Coluna lombar"],
    criterios: [
      "Tronco estável sem rotações",
      "Olhar para o solo (cervical neutra)",
      "Amplitude controlada",
      "Respiração rítmica",
    ],
    compensacoes: [
      "Rotação compensatória do tronco",
      "Hiperextensão cervical",
      "Quebra do padrão cruzado",
    ],
    feedback: [
      "Padrão cruzado consistente em 88% das repetições",
      "Leve rotação do tronco para o lado direito",
    ],
  },
  {
    id: "squat",
    nome: "Squat",
    categoria: "Funcional",
    nivel: "Iniciante",
    objetivo: "Força",
    vista: "Frontal",
    descricao:
      "Agachamento funcional integrado ao repertório Pilates. Trabalha cadeia posterior, controle de tronco e alinhamento de joelhos.",
    articulacoes: ["Tornozelo", "Joelho", "Coxofemoral", "Coluna"],
    criterios: [
      "Joelhos alinhados aos pés",
      "Tronco com curvatura natural",
      "Distribuição de peso no médio-pé",
      "Descida controlada",
    ],
    compensacoes: [
      "Joelhos em valgo",
      "Anteriorização do tronco excessiva",
      "Elevação dos calcanhares",
      "Báscula pélvica anterior",
    ],
    feedback: [
      "Alinhamento joelho-pé dentro do tolerável (±4°)",
      "Profundidade média: 92° de flexão de joelho",
    ],
  },
  {
    id: "lunge",
    nome: "Lunge",
    categoria: "Funcional",
    nivel: "Intermediário",
    objetivo: "Equilíbrio",
    vista: "Lateral",
    descricao:
      "Avanço unipodal com descida controlada do joelho posterior. Desafia o equilíbrio dinâmico e a estabilidade do core sob carga assimétrica.",
    articulacoes: ["Joelho", "Coxofemoral", "Tornozelo"],
    criterios: [
      "Joelho da frente sobre o tornozelo",
      "Tronco vertical",
      "Pelve nivelada",
      "Descida controlada",
    ],
    compensacoes: [
      "Joelho ultrapassando o pé",
      "Inclinação lateral do tronco",
      "Queda pélvica contralateral",
    ],
    feedback: [
      "Simetria D/E: 89%",
      "Leve queda pélvica esquerda detectada",
    ],
  },
  {
    id: "spine-stretch",
    nome: "Spine Stretch",
    categoria: "Alongamento",
    nivel: "Iniciante",
    objetivo: "Mobilidade",
    vista: "Lateral",
    descricao:
      "Sentado com pernas estendidas, articula flexão da coluna em direção aos pés, promovendo alongamento da cadeia posterior e mobilidade torácica.",
    articulacoes: ["Coluna torácica", "Coluna lombar", "Coxofemoral"],
    criterios: [
      "Flexão articulada vértebra a vértebra",
      "Ísquios ancorados",
      "Cervical em continuidade",
      "Braços paralelos ao solo",
    ],
    compensacoes: [
      "Flexão concentrada nos quadris",
      "Cabeça projetada à frente",
      "Curvatura em bloco",
    ],
    feedback: [
      "Sequenciamento melhorado em 18% vs. baseline",
      "Mobilidade torácica funcional",
    ],
  },
  {
    id: "cat-stretch",
    nome: "Cat Stretch",
    categoria: "Alongamento",
    nivel: "Iniciante",
    objetivo: "Mobilidade",
    vista: "Lateral",
    descricao:
      "Em quatro apoios, alterna flexão e extensão da coluna em movimento fluido. Excelente para mobilidade segmentar e consciência corporal.",
    articulacoes: ["Coluna inteira", "Ombros", "Coxofemoral"],
    criterios: [
      "Movimento iniciado pela pelve",
      "Distribuição harmônica entre segmentos",
      "Ombros estabilizados",
      "Respiração sincronizada",
    ],
    compensacoes: [
      "Concentração do movimento em um segmento",
      "Cotovelos hiperestendidos",
      "Respiração superficial",
    ],
    feedback: [
      "Fluidez do movimento alta",
      "Boa amplitude torácica",
    ],
  },
  {
    id: "mermaid",
    nome: "Mermaid",
    categoria: "Mat",
    nivel: "Intermediário",
    objetivo: "Mobilidade",
    vista: "Frontal",
    descricao:
      "Sentado lateralmente, realiza inclinação lateral da coluna com braço estendido acima da cabeça, alongando cadeia lateral e abrindo caixa torácica.",
    articulacoes: ["Coluna torácica", "Coluna lombar", "Ombro"],
    criterios: [
      "Ísquio contralateral ancorado",
      "Alongamento contínuo até a ponta dos dedos",
      "Sem rotação do tronco",
      "Cervical alinhada",
    ],
    compensacoes: [
      "Rotação compensatória",
      "Elevação do ombro de apoio",
      "Perda do contato isquial",
    ],
    feedback: [
      "Amplitude lateral simétrica",
      "Atenção: ombro de apoio elevado ~2cm",
    ],
  },
  {
    id: "side-kicks",
    nome: "Side Kicks",
    categoria: "Mat",
    nivel: "Intermediário",
    objetivo: "Estabilidade",
    vista: "Lateral",
    descricao:
      "Deitado de lado, realiza chutes anteroposteriores com a perna superior mantendo o tronco absolutamente estável. Trabalha estabilidade lombo-pélvica e mobilidade de quadril.",
    articulacoes: ["Coxofemoral", "Coluna lombar"],
    criterios: [
      "Tronco imóvel",
      "Pelve empilhada",
      "Pé em flexão na ida, ponta na volta",
      "Amplitude funcional",
    ],
    compensacoes: [
      "Báscula pélvica posterior",
      "Rotação do tronco",
      "Encurtamento da amplitude",
    ],
    feedback: [
      "Estabilidade pélvica 91% do tempo",
      "Amplitude D > E em ~8°",
    ],
  },
];

const CATEGORIAS: Categoria[] = ["Mat", "Reformer", "Funcional", "Alongamento"];
const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
const OBJETIVOS: Objetivo[] = [
  "Core",
  "Mobilidade",
  "Estabilidade",
  "Força",
  "Postura",
  "Equilíbrio",
];

function nivelColor(n: Nivel) {
  switch (n) {
    case "Iniciante":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "Intermediário":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "Avançado":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }
}

function ExerciciosPage() {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "Todas">("Todas");
  const [nivel, setNivel] = useState<Nivel | "Todos">("Todos");
  const [objetivo, setObjetivo] = useState<Objetivo | "Todos">("Todos");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [prescritos, setPrescritos] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (categoria !== "Todas" && e.categoria !== categoria) return false;
      if (nivel !== "Todos" && e.nivel !== nivel) return false;
      if (objetivo !== "Todos" && e.objetivo !== objetivo) return false;
      if (query && !e.nome.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [query, categoria, nivel, objetivo]);

  const limparFiltros = () => {
    setCategoria("Todas");
    setNivel("Todos");
    setObjetivo("Todos");
    setQuery("");
  };

  const adicionarPrescricao = (ex: Exercise) => {
    if (prescritos.includes(ex.id)) {
      toast.info(`${ex.nome} já está na prescrição`);
      return;
    }
    setPrescritos((p) => [...p, ex.id]);
    toast.success(`${ex.nome} adicionado à prescrição`, {
      description: "Visível no plano do aluno atual.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/30 backdrop-blur-xl sticky top-0 z-20">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">
                Biblioteca de Exercícios
              </h1>
              <p className="text-xs text-muted-foreground">
                Repertório Pilates com análise clínica assistida por IA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">
              {prescritos.length} na prescrição
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Filters */}
        <section className="mb-8 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Filtros</span>
            <div className="ml-auto">
              <button
                onClick={limparFiltros}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar exercício..."
                className="pl-9"
              />
            </div>

            <FilterGroup
              label="Categoria"
              options={["Todas", ...CATEGORIAS]}
              value={categoria}
              onChange={(v) => setCategoria(v as Categoria | "Todas")}
            />
            <FilterGroup
              label="Nível"
              options={["Todos", ...NIVEIS]}
              value={nivel}
              onChange={(v) => setNivel(v as Nivel | "Todos")}
            />
            <FilterGroup
              label="Objetivo"
              options={["Todos", ...OBJETIVOS]}
              value={objetivo}
              onChange={(v) => setObjetivo(v as Objetivo | "Todos")}
            />
          </div>
        </section>

        {/* Grid */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} exercício{filtered.length === 1 ? "" : "s"} encontrado
            {filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((ex, idx) => (
              <motion.div
                key={ex.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
              >
                <ExerciseCard
                  ex={ex}
                  selected={prescritos.includes(ex.id)}
                  onOpen={() => setSelected(ex)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum exercício corresponde aos filtros.
          </div>
        )}
      </main>

      {/* Drawer / Detail */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto bg-card/95 backdrop-blur-xl border-border/60"
        >
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    {selected.categoria}
                  </Badge>
                  <Badge variant="outline" className={nivelColor(selected.nivel)}>
                    {selected.nivel}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    {selected.objetivo}
                  </Badge>
                </div>
                <SheetTitle className="font-display text-2xl tracking-tight">
                  {selected.nome}
                </SheetTitle>
                <SheetDescription className="text-base leading-relaxed">
                  {selected.descricao}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <DetailBlock
                  icon={<Activity className="h-4 w-4" />}
                  title="Articulações analisadas"
                >
                  <div className="flex flex-wrap gap-2">
                    {selected.articulacoes.map((a) => (
                      <Badge key={a} variant="secondary" className="font-normal">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </DetailBlock>

                <DetailBlock
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  title="Critérios de qualidade"
                >
                  <ul className="space-y-2">
                    {selected.criterios.map((c) => (
                      <li key={c} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </DetailBlock>

                <DetailBlock
                  icon={<Target className="h-4 w-4 text-rose-400" />}
                  title="Compensações comuns"
                >
                  <ul className="space-y-2">
                    {selected.compensacoes.map((c) => (
                      <li key={c} className="flex gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{c}</span>
                      </li>
                    ))}
                  </ul>
                </DetailBlock>

                <DetailBlock
                  icon={<TrendingUp className="h-4 w-4 text-primary" />}
                  title="Feedback automático (IA)"
                >
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-2">
                    {selected.feedback.map((f) => (
                      <div key={f} className="flex gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </DetailBlock>

                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Vista ideal: <span className="text-foreground">{selected.vista}</span>
                  </div>
                  <Button
                    onClick={() => adicionarPrescricao(selected)}
                    className="ml-auto"
                    variant={prescritos.includes(selected.id) ? "secondary" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {prescritos.includes(selected.id)
                      ? "Já prescrito"
                      : "Adicionar à prescrição"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseCard({
  ex,
  selected,
  onOpen,
}: {
  ex: Exercise;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="group relative h-full rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 hover:border-primary/40 hover:bg-card/70 transition-all duration-300 flex flex-col">
      {selected && (
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="border-primary/50 text-primary text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Prescrito
          </Badge>
        </div>
      )}

      {/* Visual placeholder */}
      <div className="relative h-32 -mx-5 -mt-5 mb-4 rounded-t-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-border/60">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-display text-5xl font-bold text-primary/30 group-hover:text-primary/50 transition-colors">
            {ex.nome
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
        </div>
        <div className="absolute bottom-2 left-3 flex gap-1.5">
          <Badge variant="outline" className="border-border/60 bg-background/60 backdrop-blur text-[10px]">
            <Eye className="h-2.5 w-2.5 mr-1" /> {ex.vista}
          </Badge>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-lg font-semibold leading-tight">{ex.nome}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
          {ex.categoria}
        </Badge>
        <Badge variant="outline" className={`text-[10px] ${nivelColor(ex.nivel)}`}>
          {ex.nivel}
        </Badge>
        <Badge variant="outline" className="border-border text-[10px]">
          {ex.objetivo}
        </Badge>
      </div>

      <div className="mt-auto pt-3 border-t border-border/40 space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Compensações comuns
        </div>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {ex.compensacoes.slice(0, 2).map((c) => (
            <li key={c} className="flex gap-1.5">
              <span className="text-rose-400/70">•</span>
              <span className="line-clamp-1">{c}</span>
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpen}
          className="w-full mt-3 group/btn"
        >
          Ver detalhes
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

function DetailBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}