/**
 * Catálogo unificado de movimentos funcionais + repertório Pilates.
 * Usado pelo seletor buscável (ExerciseCatalogPicker) para popular tanto a
 * triagem funcional (movement_results) quanto a avaliação por exercício
 * (exercise_results). Não altera schema.
 */

export type ExerciseCategory =
  | "funcional"
  | "mat"
  | "reformer"
  | "cadillac"
  | "chair"
  | "barrel";

export type ExerciseLevel = "basico" | "intermediario" | "avancado";

export type Apparatus = "—" | "Solo" | "Reformer" | "Cadillac" | "Chair" | "Barrel";

export interface ExerciseCatalogItem {
  name: string;
  category: ExerciseCategory;
  apparatus: Apparatus;
  level: ExerciseLevel | null;
}

export const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  funcional: "Funcional",
  mat: "Mat",
  reformer: "Reformer",
  cadillac: "Cadillac",
  chair: "Chair",
  barrel: "Barril",
};

export const LEVEL_LABEL: Record<ExerciseLevel, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const funcional = (name: string): ExerciseCatalogItem => ({
  name,
  category: "funcional",
  apparatus: "—",
  level: null,
});

const mkPilates =
  (category: ExerciseCategory, apparatus: Apparatus) =>
  (name: string, level: ExerciseLevel): ExerciseCatalogItem => ({
    name,
    category,
    apparatus,
    level,
  });

const mat = mkPilates("mat", "Solo");
const ref = mkPilates("reformer", "Reformer");
const cad = mkPilates("cadillac", "Cadillac");
const chr = mkPilates("chair", "Chair");
const bar = mkPilates("barrel", "Barrel");

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [
  // FUNCIONAL
  funcional("Agachamento"),
  funcional("Ponte"),
  funcional("Lunge"),
  funcional("Apoio unipodal"),
  funcional("Sentar e levantar"),
  funcional("Flexão de tronco"),
  funcional("Elevação de membros superiores"),
  funcional("Movimento livre"),

  // MAT
  mat("The Hundred", "basico"),
  mat("Roll Up", "basico"),
  mat("Single Leg Circles", "basico"),
  mat("Rolling Like a Ball", "basico"),
  mat("Single Leg Stretch", "basico"),
  mat("Double Leg Stretch", "basico"),
  mat("Spine Stretch Forward", "basico"),
  mat("Single Leg Kick", "basico"),
  mat("Shoulder Bridge", "basico"),
  mat("Spine Twist", "basico"),
  mat("Swan (prep)", "basico"),
  mat("Roll Over", "intermediario"),
  mat("Open Leg Rocker", "intermediario"),
  mat("Corkscrew", "intermediario"),
  mat("Saw", "intermediario"),
  mat("Double Leg Kick", "intermediario"),
  mat("Neck Pull", "intermediario"),
  mat("Scissors", "intermediario"),
  mat("Bicycle", "intermediario"),
  mat("Jack Knife", "intermediario"),
  mat("Teaser", "intermediario"),
  mat("Swimming", "intermediario"),
  mat("Leg Pull Front", "intermediario"),
  mat("Leg Pull Back", "intermediario"),
  mat("Side Kick (série)", "intermediario"),
  mat("Side Kick Kneeling", "intermediario"),
  mat("Swan Dive", "avancado"),
  mat("Hip Twist", "avancado"),
  mat("Side Bend", "avancado"),
  mat("Boomerang", "avancado"),
  mat("Seal", "avancado"),
  mat("Crab", "avancado"),
  mat("Rocking", "avancado"),
  mat("Control Balance", "avancado"),
  mat("Push Up", "avancado"),
  { name: "Exercício livre", category: "mat", apparatus: "Solo", level: null },

  // REFORMER
  ref("Footwork (série)", "basico"),
  ref("The Hundred", "basico"),
  ref("Overhead", "intermediario"),
  ref("Coordination", "intermediario"),
  ref("Rowing (série)", "intermediario"),
  ref("Swan (Long Box)", "intermediario"),
  ref("Pulling Straps", "intermediario"),
  ref("Backstroke", "intermediario"),
  ref("Teaser (Long Box)", "intermediario"),
  ref("Long Stretch", "intermediario"),
  ref("Down Stretch", "intermediario"),
  ref("Up Stretch", "intermediario"),
  ref("Elephant", "basico"),
  ref("Stomach Massage (série)", "basico"),
  ref("Tendon Stretch", "avancado"),
  ref("Short Box (série)", "basico"),
  ref("Short Spine", "intermediario"),
  ref("Long Spine", "avancado"),
  ref("Semi-Circle", "intermediario"),
  ref("Chest Expansion", "basico"),
  ref("Thigh Stretch", "basico"),
  ref("Knee Stretches", "intermediario"),
  ref("Running", "basico"),
  ref("Pelvic Lift", "intermediario"),
  ref("Front Splits", "avancado"),
  ref("Long Back Stretch", "avancado"),
  ref("Snake/Twist", "avancado"),
  ref("Balance Control", "avancado"),
  ref("Knees Off", "avancado"),
  { name: "Exercício livre", category: "reformer", apparatus: "Reformer", level: null },

  // CADILLAC
  cad("Roll Down", "basico"),
  cad("Leg Springs", "basico"),
  cad("Arm Springs", "basico"),
  cad("Push Through Bar", "intermediario"),
  cad("Tower", "intermediario"),
  cad("Monkey", "intermediario"),
  cad("Breathing", "basico"),
  cad("Airplane", "avancado"),
  cad("Parakeet", "avancado"),
  cad("Half Hang", "avancado"),
  cad("Flying Eagle", "avancado"),
  cad("Hanging", "avancado"),
  { name: "Exercício livre", category: "cadillac", apparatus: "Cadillac", level: null },

  // CHAIR
  chr("Footwork", "basico"),
  chr("Pumping (uma/duas pernas)", "basico"),
  chr("Push Down", "intermediario"),
  chr("Push Up", "intermediario"),
  chr("Swan", "intermediario"),
  chr("Teaser", "intermediario"),
  chr("Going Up Front", "avancado"),
  chr("Step Up", "intermediario"),
  chr("Mountain Climb", "avancado"),
  chr("Spine Stretch", "intermediario"),
  chr("Twist", "intermediario"),
  chr("Tendon Stretch", "intermediario"),
  chr("Washer Woman", "intermediario"),
  { name: "Exercício livre", category: "chair", apparatus: "Chair", level: null },

  // BARREL
  bar("Swan/Backbend", "intermediario"),
  bar("Short Box", "intermediario"),
  bar("Side Stretch", "intermediario"),
  bar("Hip Circles", "intermediario"),
  bar("Ballet Stretches", "intermediario"),
  bar("The Hundred", "basico"),
  bar("Scissors", "intermediario"),
  bar("Bicycle", "intermediario"),
  bar("Teaser", "intermediario"),
  bar("Horseback", "avancado"),
  { name: "Exercício livre", category: "barrel", apparatus: "Barrel", level: null },
];

export function isPilatesCategory(c: ExerciseCategory): boolean {
  return c !== "funcional";
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface CatalogFilter {
  query?: string;
  category?: ExerciseCategory | "all";
  level?: ExerciseLevel | "all";
}

export function filterCatalog(
  items: ExerciseCatalogItem[],
  { query, category, level }: CatalogFilter,
): ExerciseCatalogItem[] {
  const q = query ? normalize(query.trim()) : "";
  return items.filter((it) => {
    if (category && category !== "all" && it.category !== category) return false;
    if (level && level !== "all") {
      if (it.category === "funcional") return false;
      if (it.level !== level) return false;
    }
    if (q) {
      const hay = `${normalize(it.name)} ${normalize(CATEGORY_LABEL[it.category])} ${
        it.apparatus
      }`;
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}