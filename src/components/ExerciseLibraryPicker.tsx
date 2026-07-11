import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
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
  LEVEL_LABEL_LIB,
  useExerciseLibrary,
  type ExerciseLibraryRow,
} from "@/lib/exerciseLibraryStore";

interface Props {
  selectedId?: string | null;
  onPick: (item: ExerciseLibraryRow) => void;
}

export function ExerciseLibraryPicker({ selectedId, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [goal, setGoal] = useState<string>("all");

  const { rows, options, loading } = useExerciseLibrary({
    query,
    equipment,
    level,
    primaryGoal: goal,
  });

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, equipamento ou objetivo…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Select value={equipment} onValueChange={setEquipment}>
          <SelectTrigger>
            <SelectValue placeholder="Equipamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os equipamentos</SelectItem>
            {options.equipments.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            {options.levels.map((l) => (
              <SelectItem key={l} value={l}>
                {LEVEL_LABEL_LIB[l] ?? l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={goal} onValueChange={setGoal}>
          <SelectTrigger>
            <SelectValue placeholder="Objetivo clínico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os objetivos</SelectItem>
            {options.goals.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-72 rounded-md border border-border/50 bg-card/30">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando catálogo…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Nenhum exercício encontrado com os filtros atuais.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((it) => {
              const active = selectedId === it.id;
              return (
                <li key={it.id}>
                  <Button
                    type="button"
                    variant={active ? "hero" : "ghost"}
                    size="sm"
                    onClick={() => onPick(it)}
                    className="h-auto w-full justify-between whitespace-normal px-3 py-2 text-left"
                  >
                    <span className="flex flex-col items-start gap-0.5">
                      <span className="text-sm">{it.name_pt}</span>
                      {it.primary_goal && (
                        <span className="text-[10px] text-muted-foreground">
                          {it.primary_goal}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {it.equipment}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {LEVEL_LABEL_LIB[it.level] ?? it.level}
                      </Badge>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}