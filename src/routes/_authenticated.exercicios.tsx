import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Filter,
  Info,
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
import { ImageAnalyzer } from "@/components/ImageAnalyzer";
import {
  CATEGORY_LABEL,
  EXERCISE_CATALOG,
  EXERCISE_SCORE_DOMAINS,
  LEVEL_LABEL,
  filterCatalog,
  type ExerciseCatalogItem,
  type ExerciseCategory,
  type ExerciseLevel,
} from "@/lib/exerciseCatalog";

export const Route = createFileRoute("/_authenticated/exercicios")({
  component: ExerciciosPage,
  head: () => ({
    meta: [
      { title: "Exercícios Pilates | PilatesVision" },
      {
        name: "description",
        content:
          "Biblioteca de exercícios Pilates com critérios de qualidade, compensações comuns, red flags e métricas de visão — apoio à decisão clínica.",
      },
    ],
  }),
});

const CATEGORY_OPTIONS: Array<ExerciseCategory | "all"> = [
  "all",
  "funcional",
  "mat",
  "reformer",
  "cadillac",
  "chair",
  "barrel",
];

const LEVEL_OPTIONS: Array<ExerciseLevel | "all"> = [
  "all",
  "basico",
  "intermediario",
  "avancado",
];

function categoryLabel(c: ExerciseCategory | "all"): string {
  return c === "all" ? "Todas" : CATEGORY_LABEL[c];
}

function levelLabel(l: ExerciseLevel | "all"): string {
  return l === "all" ? "Todos" : LEVEL_LABEL[l];
}

function levelColor(l: ExerciseLevel | null): string {
  switch (l) {
    case "basico":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "intermediario":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "avancado":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    default:
      return "bg-muted/40 text-muted-foreground border-border/60";
  }
}

function itemKey(it: ExerciseCatalogItem): string {
  return it.id ?? `${it.category}-${it.name}`;
}

function ExerciciosPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "all">("all");
  const [level, setLevel] = useState<ExerciseLevel | "all">("all");
  const [selected, setSelected] = useState<ExerciseCatalogItem | null>(null);
  const [prescritos, setPrescritos] = useState<string[]>([]);

  const filtered = useMemo(
    () => filterCatalog(EXERCISE_CATALOG, { query, category, level }),
    [query, category, level],
  );

  const limparFiltros = () => {
    setCategory("all");
    setLevel("all");
    setQuery("");
  };

  const adicionarPrescricao = (ex: ExerciseCatalogItem) => {
    const key = itemKey(ex);
    if (prescritos.includes(key)) {
      toast.info(`${ex.name} já está na prescrição`);
      return;
    }
    setPrescritos((p) => [...p, key]);
    toast.success(`${ex.name} adicionado à prescrição`, {
      description: "Confirmação profissional necessária antes da execução.",
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
                Repertório Pilates — apoio à decisão clínica
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
        {/* Clinical disclaimer */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border/50 bg-card/40 p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            O PilatesVision organiza indicadores e sugestões de apoio. A seleção
            final do exercício deve ser confirmada pelo profissional.
          </p>
        </div>

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

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, aparelho, método ou objetivo..."
                className="pl-9"
              />
            </div>

            <FilterGroup
              label="Categoria"
              options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: categoryLabel(c) }))}
              value={category}
              onChange={(v) => setCategory(v as ExerciseCategory | "all")}
            />
            <FilterGroup
              label="Nível"
              options={LEVEL_OPTIONS.map((l) => ({ value: l, label: levelLabel(l) }))}
              value={level}
              onChange={(v) => setLevel(v as ExerciseLevel | "all")}
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
                key={itemKey(ex)}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
              >
                <ExerciseCard
                  ex={ex}
                  selected={prescritos.includes(itemKey(ex))}
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
                    {CATEGORY_LABEL[selected.category]}
                  </Badge>
                  {selected.level && (
                    <Badge variant="outline" className={levelColor(selected.level)}>
                      {LEVEL_LABEL[selected.level]}
                    </Badge>
                  )}
                  {selected.equipment && (
                    <Badge variant="outline" className="border-border">
                      {selected.equipment}
                    </Badge>
                  )}
                </div>
                <SheetTitle className="font-display text-2xl tracking-tight">
                  {selected.name}
                  {selected.namePt && selected.namePt !== selected.name && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      · {selected.namePt}
                    </span>
                  )}
                </SheetTitle>
                <SheetDescription className="text-base leading-relaxed">
                  {selected.primaryGoal
                    ? `Objetivo clínico: ${selected.primaryGoal}.`
                    : "Exercício do repertório PilatesVision."}
                  {selected.position && (
                    <>
                      {" "}
                      Posição: {selected.position}.
                    </>
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {selected.clinicalFocus && (
                  <DetailBlock icon={<Activity className="h-4 w-4" />} title="Foco clínico">
                    <p className="text-sm text-muted-foreground">{selected.clinicalFocus}</p>
                  </DetailBlock>
                )}

                {selected.methodFamily && (
                  <DetailBlock icon={<Target className="h-4 w-4" />} title="Família/método">
                    <p className="text-sm text-muted-foreground">{selected.methodFamily}</p>
                  </DetailBlock>
                )}

                {selected.execution && (
                  <DetailBlock
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    title="Execução"
                  >
                    <p className="text-sm text-muted-foreground">{selected.execution}</p>
                  </DetailBlock>
                )}

                {selected.keyCues && selected.keyCues.length > 0 && (
                  <DetailBlock
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    title="Cues principais"
                  >
                    <ul className="space-y-2">
                      {selected.keyCues.map((c) => (
                        <li key={c} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}

                {selected.visionMetrics && selected.visionMetrics.length > 0 && (
                  <DetailBlock
                    icon={<TrendingUp className="h-4 w-4 text-primary" />}
                    title="Métricas de visão"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selected.visionMetrics.map((m) => (
                        <Badge key={m} variant="secondary" className="font-normal">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </DetailBlock>
                )}

                {selected.commonCompensations && selected.commonCompensations.length > 0 && (
                  <DetailBlock
                    icon={<Target className="h-4 w-4 text-rose-400" />}
                    title="Compensações comuns (alertas)"
                  >
                    <ul className="space-y-2">
                      {selected.commonCompensations.map((c) => (
                        <li key={c} className="flex gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}

                {selected.redFlags && selected.redFlags.length > 0 && (
                  <DetailBlock
                    icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}
                    title="Red flags"
                  >
                    <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 space-y-2">
                      {selected.redFlags.map((f) => (
                        <div key={f} className="flex gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </DetailBlock>
                )}

                {(selected.regression || selected.progression) && (
                  <DetailBlock icon={<Activity className="h-4 w-4" />} title="Regressão / Progressão">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      {selected.regression && (
                        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Regressão
                          </div>
                          <div>{selected.regression}</div>
                        </div>
                      )}
                      {selected.progression && (
                        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                            Progressão
                          </div>
                          <div>{selected.progression}</div>
                        </div>
                      )}
                    </div>
                  </DetailBlock>
                )}

                <DetailBlock icon={<TrendingUp className="h-4 w-4 text-primary" />} title="Domínios de score">
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <ul className="space-y-1.5 text-sm">
                      {(selected.scoreDomains ?? EXERCISE_SCORE_DOMAINS).map((d) => (
                        <li key={d.key} className="flex justify-between gap-3">
                          <span>{d.label}</span>
                          <span className="text-muted-foreground">{d.weight}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DetailBlock>

                <DetailBlock
                  icon={<Sparkles className="h-4 w-4 text-primary" />}
                  title="Análise por imagem"
                >
                  <ImageAnalyzer
                    mode="exercicio"
                    context={`Exercício: ${selected.name} (${CATEGORY_LABEL[selected.category]}${selected.equipment ? `, ${selected.equipment}` : ""}). Cues: ${(selected.keyCues ?? []).join("; ")}.`}
                    label={`Execução · ${selected.name}`}
                    compact
                  />
                </DetailBlock>

                {selected.safetyNote && (
                  <p className="text-[11px] text-muted-foreground">{selected.safetyNote}</p>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Apoio à decisão — confirme com o profissional.
                  </div>
                  <Button
                    onClick={() => adicionarPrescricao(selected)}
                    className="ml-auto"
                    variant={prescritos.includes(itemKey(selected)) ? "secondary" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {prescritos.includes(itemKey(selected))
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
  options: Array<{ value: string; label: string }>;
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
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {opt.label}
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
  ex: ExerciseCatalogItem;
  selected: boolean;
  onOpen: () => void;
}) {
  const displayEquipment = ex.equipment ?? (ex.apparatus === "—" ? "Sem equipamento" : ex.apparatus);
  const initials = ex.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
            {initials}
          </div>
        </div>
        <div className="absolute bottom-2 left-3 flex gap-1.5">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/60 backdrop-blur text-[10px]"
          >
            <Eye className="h-2.5 w-2.5 mr-1" /> {displayEquipment}
          </Badge>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-lg font-semibold leading-tight">{ex.name}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
          {CATEGORY_LABEL[ex.category]}
        </Badge>
        {ex.level && (
          <Badge variant="outline" className={`text-[10px] ${levelColor(ex.level)}`}>
            {LEVEL_LABEL[ex.level]}
          </Badge>
        )}
        {ex.primaryGoal && (
          <Badge variant="outline" className="border-border text-[10px]">
            {ex.primaryGoal.length > 32 ? `${ex.primaryGoal.slice(0, 30)}…` : ex.primaryGoal}
          </Badge>
        )}
      </div>

      {ex.clinicalFocus && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          Foco: {ex.clinicalFocus}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-border/40 space-y-2">
        {ex.visionMetrics && ex.visionMetrics.length > 0 && (
          <>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Métricas de visão
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {ex.visionMetrics.slice(0, 2).map((m) => (
                <li key={m} className="flex gap-1.5">
                  <span className="text-primary/70">•</span>
                  <span className="line-clamp-1">{m}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {ex.redFlags && ex.redFlags.length > 0 && (
          <>
            <div className="text-[11px] uppercase tracking-wider text-rose-400/80 pt-1">
              Red flags
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {ex.redFlags.slice(0, 2).map((r) => (
                <li key={r} className="flex gap-1.5">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-rose-400/70" />
                  <span className="line-clamp-1">{r}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Button variant="outline" size="sm" onClick={onOpen} className="w-full mt-3 group/btn">
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
