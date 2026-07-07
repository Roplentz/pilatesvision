import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABEL,
  EXERCISE_CATALOG,
  LEVEL_LABEL,
  filterCatalog,
  type ExerciseCatalogItem,
  type ExerciseCategory,
  type ExerciseLevel,
} from "@/lib/exerciseCatalog";

interface Props {
  /** Restringe as categorias exibidas (ex.: apenas funcional em MovementSection). */
  allowedCategories?: ExerciseCategory[];
  /** Categoria selecionada inicialmente. */
  defaultCategory?: ExerciseCategory | "all";
  /** Nome atualmente escolhido (destacado na lista). */
  selectedName?: string | null;
  onPick: (item: ExerciseCatalogItem) => void;
}

const ALL_CATEGORIES: ExerciseCategory[] = [
  "funcional",
  "mat",
  "reformer",
  "cadillac",
  "chair",
  "barrel",
];

export function ExerciseCatalogPicker({
  allowedCategories,
  defaultCategory = "all",
  selectedName,
  onPick,
}: Props) {
  const categories = allowedCategories ?? ALL_CATEGORIES;
  const initialCategory: ExerciseCategory | "all" =
    categories.length === 1 ? categories[0] : defaultCategory;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "all">(initialCategory);
  const [level, setLevel] = useState<ExerciseLevel | "all">("all");

  const pool = useMemo(
    () => EXERCISE_CATALOG.filter((it) => categories.includes(it.category)),
    [categories],
  );

  const filtered = useMemo(
    () => filterCatalog(pool, { query, category, level }),
    [pool, query, category, level],
  );

  const grouped = useMemo(() => {
    const map = new Map<ExerciseCategory, ExerciseCatalogItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return map;
  }, [filtered]);

  const tabs: Array<ExerciseCategory | "all"> =
    categories.length > 1 ? ["all", ...categories] : [categories[0]];

  const showLevelFilter =
    category !== "funcional" &&
    (category === "all" ? categories.some((c) => c !== "funcional") : true);

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exercício por nome, categoria ou aparelho…"
            className="pl-8"
          />
        </div>
        {showLevelFilter && (
          <Select value={level} onValueChange={(v) => setLevel(v as ExerciseLevel | "all")}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="basico">{LEVEL_LABEL.basico}</SelectItem>
              <SelectItem value="intermediario">{LEVEL_LABEL.intermediario}</SelectItem>
              <SelectItem value="avancado">{LEVEL_LABEL.avancado}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = category === t;
            const label = t === "all" ? "Todos" : CATEGORY_LABEL[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setCategory(t)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <ScrollArea className="h-72 rounded-md border border-border/50 bg-card/30">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Nenhum exercício encontrado. Ajuste a busca ou o filtro de nível.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {Array.from(grouped.entries()).map(([cat, list]) => (
              <div key={cat} className="p-2">
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABEL[cat]}
                </div>
                <ul className="space-y-1">
                  {list.map((it) => {
                    const active =
                      selectedName && selectedName === it.name;
                    return (
                      <li key={`${it.category}-${it.name}`}>
                        <Button
                          type="button"
                          variant={active ? "hero" : "ghost"}
                          size="sm"
                          onClick={() => onPick(it)}
                          className="h-auto w-full justify-between whitespace-normal px-3 py-2 text-left"
                        >
                          <span className="text-sm">{it.name}</span>
                          <span className="flex shrink-0 items-center gap-1">
                            {it.apparatus !== "—" && (
                              <Badge variant="outline" className="text-[10px]">
                                {it.apparatus}
                              </Badge>
                            )}
                            {it.level && (
                              <Badge variant="outline" className="text-[10px]">
                                {LEVEL_LABEL[it.level]}
                              </Badge>
                            )}
                          </span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}