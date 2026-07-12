/**
 * Catálogo unificado de movimentos funcionais + repertório Pilates.
 *
 * Consumido por:
 * - `ExerciseCatalogPicker` (triagem funcional + avaliação por exercício);
 * - rota `/exercicios` (biblioteca visual);
 * - `avaliacao-dinamica` (destino movement_results vs exercise_results).
 *
 * Fonte oficial dos dados enriquecidos:
 *   docs/clinical_decision_support/exercise_catalog.csv
 * Ver também:
 *   docs/knowledge-packs/exercises/pilatesvision-exercise-knowledge-pack-v1.md
 *
 * Não altera schema. Apoio à decisão clínica — não é diagnóstico nem
 * prescrição automática.
 */

export type ExerciseCategory = "funcional" | "mat" | "reformer" | "cadillac" | "chair" | "barrel";

export type ExerciseLevel = "basico" | "intermediario" | "avancado";

export type Apparatus = "—" | "Solo" | "Reformer" | "Cadillac" | "Chair" | "Barrel";

/**
 * Domínio de score utilizado como indicador de apoio à decisão.
 * Nunca representa diagnóstico ou nota clínica definitiva.
 */
export interface ScoreDomain {
  key: string;
  label: string;
  /** Peso relativo em pontos percentuais. Soma esperada = 100. */
  weight: number;
}

export const EXERCISE_SCORE_DOMAINS: ScoreDomain[] = [
  { key: "alignment", label: "Alinhamento", weight: 30 },
  { key: "safe_range", label: "Amplitude segura", weight: 20 },
  { key: "control", label: "Controle/fluidez", weight: 20 },
  { key: "symmetry", label: "Simetria", weight: 15 },
  { key: "timing", label: "Tempo/cadência", weight: 10 },
  { key: "tolerance", label: "Tolerância clínica", weight: 5 },
];

export interface ExerciseCatalogItem {
  // Compatibilidade legada (usada por ExerciseCatalogPicker e avaliacao-dinamica).
  name: string;
  category: ExerciseCategory;
  apparatus: Apparatus;
  level: ExerciseLevel | null;

  // Campos enriquecidos (opcionais para preservar compatibilidade).
  id?: string;
  namePt?: string;
  nameEn?: string;
  /** Equipamento mais granular vindo do CSV (ex.: "Wunda/Stability Chair"). */
  equipment?: string;
  /** Família/método (ex.: "Mat clássico", "Reformer", "Acessórios"). */
  methodFamily?: string;
  /** Posição inicial descritiva. */
  position?: string;
  /** Objetivo clínico principal. */
  primaryGoal?: string;
  /** Foco clínico complementar. */
  clinicalFocus?: string;
  /** Preparo/set-up. */
  setup?: string;
  /** Descrição da execução. */
  execution?: string;
  /** Cues principais para o profissional. */
  keyCues?: string[];
  /** Métricas observáveis por visão computacional. */
  visionMetrics?: string[];
  /** Compensações comuns — servem como alerta. */
  commonCompensations?: string[];
  /** Red flags clínicos. */
  redFlags?: string[];
  /** Regressão sugerida. */
  regression?: string;
  /** Progressão sugerida. */
  progression?: string;
  /** Domínios de score específicos; ausente = usar EXERCISE_SCORE_DOMAINS. */
  scoreDomains?: ScoreDomain[];
  /** Tags para busca livre. */
  tags?: string[];
  /** Nota de segurança/prudência exibida no detalhe. */
  safetyNote?: string;
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

// ---------------------------------------------------------------------------
// Enriched items — sourced from docs/clinical_decision_support/exercise_catalog.csv
// ---------------------------------------------------------------------------

const SAFETY_NOTE =
  "Indicador de apoio à decisão. Requer confirmação profissional — não substitui avaliação clínica.";

function splitList(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface EnrichedInput {
  id: string;
  namePt: string;
  nameEn: string;
  category: ExerciseCategory;
  apparatus: Apparatus;
  level: ExerciseLevel;
  equipment: string;
  methodFamily: string;
  position: string;
  primaryGoal: string;
  clinicalFocus: string;
  setup: string;
  execution: string;
  keyCues: string;
  visionMetrics: string;
  commonCompensations: string;
  redFlags: string;
  regression: string;
  progression: string;
  /** Sobrescreve o `.name` legado. Padrão: `nameEn`. */
  displayName?: string;
  tags?: string[];
}

function enrich(row: EnrichedInput): ExerciseCatalogItem {
  return {
    name: row.displayName ?? row.nameEn,
    category: row.category,
    apparatus: row.apparatus,
    level: row.level,
    id: row.id,
    namePt: row.namePt,
    nameEn: row.nameEn,
    equipment: row.equipment,
    methodFamily: row.methodFamily,
    position: row.position,
    primaryGoal: row.primaryGoal,
    clinicalFocus: row.clinicalFocus,
    setup: row.setup,
    execution: row.execution,
    keyCues: splitList(row.keyCues.replace(/;/g, ",")),
    visionMetrics: splitList(row.visionMetrics),
    commonCompensations: splitList(row.commonCompensations),
    redFlags: splitList(row.redFlags),
    regression: row.regression,
    progression: row.progression,
    tags: row.tags,
    safetyNote: SAFETY_NOTE,
  };
}

const ENRICHED_ITEMS: ExerciseCatalogItem[] = [
  enrich({
    id: "mat_hundred",
    namePt: "Cem",
    nameEn: "The Hundred",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico/contemporâneo",
    position: "decúbito dorsal com tronco flexionado",
    primaryGoal: "ativação de centro e coordenação respiratória",
    clinicalFocus: "controle cervical, core, resistência postural",
    setup: "deitar, elevar pernas conforme tolerância, flexionar cabeça e tronco",
    execution: "bombear braços em pequena amplitude coordenando respiração",
    keyCues: "costelas fechadas, pescoço longo, pelve estável",
    visionMetrics: "ângulo cervical, flexão de tronco, altura das pernas, estabilidade pélvica",
    commonCompensations: "protrusão cervical, prender respiração, hiperlordose, tensão em ombros",
    redFlags: "dor cervical, tontura, dispneia, dor lombar irritável",
    regression: "joelhos flexionados e cabeça apoiada",
    progression: "pernas estendidas em menor ângulo",
  }),
  enrich({
    id: "mat_roll_up",
    namePt: "Rolamento para cima",
    nameEn: "Roll Up",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico/contemporâneo",
    position: "decúbito dorsal para sentado",
    primaryGoal: "mobilidade segmentar de coluna",
    clinicalFocus: "flexibilidade posterior, dissociação coluna-pelve",
    setup: "deitar com braços acima da cabeça ou à frente",
    execution: "enrolar a coluna até sentar e flexionar à frente",
    keyCues: "subir vértebra por vértebra, evitar impulso",
    visionMetrics: "trajetória tronco, velocidade, simetria de membros, flexão segmentar",
    commonCompensations: "impulso de braços, elevação dos pés, rigidez lombar",
    redFlags: "dor lombar aguda, osteoporose importante sem adaptação",
    regression: "half roll back",
    progression: "roll up completo com controle",
  }),
  enrich({
    id: "mat_pelvic_curl",
    namePt: "Ponte articulada",
    nameEn: "Pelvic Curl",
    category: "mat",
    apparatus: "Solo",
    level: "basico",
    equipment: "Mat",
    methodFamily: "Mat contemporâneo/clínico",
    position: "decúbito dorsal joelhos flexionados",
    primaryGoal: "mobilidade lombopélvica e extensão de quadril",
    clinicalFocus: "controle lombar, glúteos, isquiotibiais",
    setup: "deitar com pés paralelos e joelhos alinhados",
    execution: "retroversão pélvica e elevação gradual da coluna",
    keyCues: "subir sem abrir joelhos, distribuir carga nos pés",
    visionMetrics: "altura pélvica, simetria ASIS, alinhamento joelho-pé",
    commonCompensations: "joelhos em valgo, hiperextensão lombar, apoio assimétrico",
    redFlags: "dor irradiada, cãibra intensa, pós-operatório sem liberação",
    regression: "ponte baixa",
    progression: "single leg bridge",
  }),
  enrich({
    id: "mat_single_leg_stretch",
    namePt: "Alongamento unilateral de perna",
    nameEn: "Single Leg Stretch",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico",
    position: "decúbito dorsal tronco flexionado",
    primaryGoal: "coordenação core-quadril",
    clinicalFocus: "controle abdominal e dissociação MMII",
    setup: "tronco flexionado, uma perna próxima ao peito, outra estendida",
    execution: "alternar pernas mantendo tronco estável",
    keyCues: "pelve quieta, cotovelos abertos, respiração fluida",
    visionMetrics: "estabilidade pélvica, ângulo do joelho, altura da perna",
    commonCompensations: "balanço de tronco, puxar pescoço, lombar arqueada",
    redFlags: "dor cervical/lombar, fraqueza abdominal importante",
    regression: "cabeça apoiada",
    progression: "double leg stretch",
  }),
  enrich({
    id: "mat_double_leg_stretch",
    namePt: "Alongamento duplo de pernas",
    nameEn: "Double Leg Stretch",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico",
    position: "decúbito dorsal tronco flexionado",
    primaryGoal: "controle de core em alavanca longa",
    clinicalFocus: "força abdominal e coordenação",
    setup: "joelhos ao peito, mãos nos tornozelos ou tíbias",
    execution: "estender braços e pernas, retornar em círculo",
    keyCues: "manter costelas baixas e pelve neutra/estável",
    visionMetrics: "ângulo pernas, abertura costal, estabilidade pélvica",
    commonCompensations: "pernas baixas demais, tensão cervical, perda de pelve",
    redFlags: "dor lombar/cervical",
    regression: "reduzir amplitude",
    progression: "pernas mais baixas e longas",
  }),
  enrich({
    id: "mat_spine_stretch",
    namePt: "Alongamento da coluna",
    nameEn: "Spine Stretch Forward",
    category: "mat",
    apparatus: "Solo",
    level: "basico",
    equipment: "Mat",
    methodFamily: "Mat clássico/contemporâneo",
    position: "sentado pernas afastadas",
    primaryGoal: "mobilidade axial e flexão torácica",
    clinicalFocus: "cadeia posterior, controle respiratório",
    setup: "sentar alto com pernas afastadas e braços à frente",
    execution: "flexionar coluna para frente como curva longa",
    keyCues: "crescer antes de flexionar, evitar colapsar lombar",
    visionMetrics: "ângulo tronco, flexão torácica, simetria ombros",
    commonCompensations: "retroverter demais, elevar ombros, flexionar joelhos",
    redFlags: "dor ciática irritável, osteoporose sem adaptação",
    regression: "sentar em apoio elevado",
    progression: "adicionar rotação",
  }),
  enrich({
    id: "mat_swan_prep",
    namePt: "Preparação para cisne",
    nameEn: "Swan Prep",
    category: "mat",
    apparatus: "Solo",
    level: "basico",
    equipment: "Mat",
    methodFamily: "Mat contemporâneo/clínico",
    position: "decúbito ventral",
    primaryGoal: "extensão torácica e controle escapular",
    clinicalFocus: "cadeia posterior, mobilidade torácica",
    setup: "deitar de barriga para baixo, mãos abaixo dos ombros",
    execution: "elevar tronco com extensão suave mantendo pelve no solo",
    keyCues: "alongar nuca, peito aberto, escápulas baixas",
    visionMetrics: "extensão torácica, hiperextensão lombar, posição cervical",
    commonCompensations: "forçar braços, comprimir lombar, elevar ombros",
    redFlags: "dor lombar facetária irritável, tontura",
    regression: "mini extensão com mãos fora do solo",
    progression: "swan dive modificado",
    displayName: "Swan (prep)",
  }),
  enrich({
    id: "mat_swimming",
    namePt: "Natação",
    nameEn: "Swimming",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico",
    position: "decúbito ventral",
    primaryGoal: "extensão global e coordenação cruzada",
    clinicalFocus: "cadeia posterior, controle lombopélvico",
    setup: "deitar em prono com braços à frente",
    execution: "alternar braços e pernas em pequena amplitude",
    keyCues: "movimento longo, costelas controladas, olhar para baixo",
    visionMetrics: "amplitude alternada, simetria, estabilidade pélvica",
    commonCompensations: "chutar alto demais, cervical em extensão, lombar comprimida",
    redFlags: "dor lombar, dor cervical, pós-operatório",
    regression: "elevar apenas braços ou pernas",
    progression: "maior tempo/cadência",
  }),
  enrich({
    id: "mat_side_kick",
    namePt: "Chute lateral",
    nameEn: "Side Kick Series",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat clássico",
    position: "decúbito lateral",
    primaryGoal: "estabilidade pélvica e controle de quadril",
    clinicalFocus: "glúteo médio, dissociação coxo-femoral",
    setup: "deitar lateral, corpo alinhado, mão apoiando cabeça",
    execution: "mobilizar perna superior mantendo pelve estável",
    keyCues: "quadril empilhado, tronco quieto, pé ativo",
    visionMetrics: "oscilação pélvica, amplitude de quadril, alinhamento tronco",
    commonCompensations: "rolar para frente/trás, tensão cervical, compensar lombar",
    redFlags: "dor lateral de quadril intensa, instabilidade",
    regression: "joelho flexionado",
    progression: "círculos e variações avançadas",
    displayName: "Side Kick (série)",
  }),
  enrich({
    id: "mat_teaser_prep",
    namePt: "Preparação para teaser",
    nameEn: "Teaser Prep",
    category: "mat",
    apparatus: "Solo",
    level: "avancado",
    equipment: "Mat",
    methodFamily: "Mat clássico/contemporâneo",
    position: "sentado/decúbito com pernas elevadas",
    primaryGoal: "controle global de core e equilíbrio",
    clinicalFocus: "força abdominal, flexores de quadril com controle",
    setup: "iniciar sentado com joelhos flexionados ou supino",
    execution: "subir tronco e pernas em V controlado",
    keyCues: "esterno aberto, pelve controlada, sem tranco",
    visionMetrics: "ângulo tronco-coxa, estabilidade, simetria",
    commonCompensations: "usar impulso, prender respiração, colapsar lombar",
    redFlags: "dor lombar/cervical, hérnia irritável",
    regression: "half teaser",
    progression: "teaser completo",
  }),
  enrich({
    id: "mat_plank",
    namePt: "Prancha",
    nameEn: "Plank",
    category: "mat",
    apparatus: "Solo",
    level: "intermediario",
    equipment: "Mat",
    methodFamily: "Mat contemporâneo/clínico",
    position: "apoio mãos/antebraços e pés",
    primaryGoal: "estabilidade de core e cintura escapular",
    clinicalFocus: "anti-extensão, ombro, controle global",
    setup: "alinhar ombros, quadril e tornozelos",
    execution: "manter posição por tempo ou com variações",
    keyCues: "empurrar o chão, costelas para dentro, glúteos ativos",
    visionMetrics: "linha ombro-quadril-tornozelo, queda pélvica, escápulas",
    commonCompensations: "quadril baixo/alto, cabeça caída, escápula alada",
    redFlags: "dor punho/ombro/lombar, hipertensão não controlada",
    regression: "joelhos apoiados",
    progression: "leg pull front",
  }),
  enrich({
    id: "mat_cat_stretch",
    namePt: "Gato",
    nameEn: "Cat Stretch",
    category: "mat",
    apparatus: "Solo",
    level: "basico",
    equipment: "Mat",
    methodFamily: "Mat clínico/contemporâneo",
    position: "quatro apoios",
    primaryGoal: "mobilidade segmentar de coluna",
    clinicalFocus: "controle respiratório e dor lombar leve",
    setup: "alinhar mãos abaixo dos ombros e joelhos abaixo do quadril",
    execution: "alternar flexão e extensão de coluna",
    keyCues: "movimento suave, distribuir pela coluna toda",
    visionMetrics: "curvatura coluna, amplitude pélvica, simetria de apoio",
    commonCompensations: "movimento só cervical/lombar, cotovelos travados",
    redFlags: "dor aguda, tontura",
    regression: "menor amplitude",
    progression: "adicionar rotação torácica",
  }),
  enrich({
    id: "ref_footwork",
    namePt: "Trabalho de pés no Reformer",
    nameEn: "Reformer Footwork",
    category: "reformer",
    apparatus: "Reformer",
    level: "basico",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "decúbito dorsal com pés na barra",
    primaryGoal: "força MMII e alinhamento em cadeia fechada",
    clinicalFocus: "quadril-joelho-pé, controle de carga",
    setup: "deitar no carrinho, pés paralelos na footbar, molas adequadas",
    execution: "empurrar e retornar carrinho com controle",
    keyCues: "joelhos seguem segundo dedo, pelve neutra, retorno freado",
    visionMetrics: "ângulo joelho, valgo/varo, simetria, controle excêntrico",
    commonCompensations: "valgo dinâmico, travar joelhos, descontrole no retorno",
    redFlags: "dor aguda no joelho/quadril, pós-operatório sem liberação",
    regression: "menor resistência/amplitude",
    progression: "variações ponta/calcanhar/unilateral",
    displayName: "Footwork (série)",
  }),
  enrich({
    id: "ref_leg_circles",
    namePt: "Círculos de pernas nas alças",
    nameEn: "Leg Circles",
    category: "reformer",
    apparatus: "Reformer",
    level: "intermediario",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "decúbito dorsal com pés nas alças",
    primaryGoal: "mobilidade de quadril com estabilidade pélvica",
    clinicalFocus: "controle lombo-pélvico, amplitude de quadril",
    setup: "colocar pés nas alças, pernas elevadas",
    execution: "realizar círculos simétricos sem mover pelve",
    keyCues: "círculos iguais, sacro pesado, respiração fluida",
    visionMetrics: "trajetória dos tornozelos, assimetria, inclinação pélvica",
    commonCompensations: "amplitude excessiva, lombar arqueada, joelhos hiperestendidos",
    redFlags: "dor lombar/virilha, prótese recente sem liberação",
    regression: "círculos pequenos",
    progression: "maior amplitude e coordenação",
  }),
  enrich({
    id: "ref_hundred",
    namePt: "Cem no Reformer",
    nameEn: "Hundred on Reformer",
    category: "reformer",
    apparatus: "Reformer",
    level: "intermediario",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "decúbito dorsal com alças",
    primaryGoal: "coordenação respiratória e resistência de core",
    clinicalFocus: "controle de tronco contra resistência",
    setup: "deitar, segurar alças, pernas em tabletop ou estendidas",
    execution: "flexionar tronco e bombear braços tensionando molas",
    keyCues: "ombros baixos, alças estáveis, pelve quieta",
    visionMetrics: "ângulo tronco, tensão braços, altura pernas",
    commonCompensations: "elevar ombros, mexer carrinho, perder pelve",
    redFlags: "dor cervical, tontura, dispneia",
    regression: "cabeça apoiada",
    progression: "pernas estendidas",
    displayName: "The Hundred",
  }),
  enrich({
    id: "ref_short_spine",
    namePt: "Coluna curta",
    nameEn: "Short Spine Massage",
    category: "reformer",
    apparatus: "Reformer",
    level: "intermediario",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "decúbito dorsal com pés nas alças",
    primaryGoal: "mobilidade de coluna e flexibilidade posterior",
    clinicalFocus: "articulação vertebral e controle abdominal",
    setup: "pés nas alças, pernas estendidas",
    execution: "elevar pelve, flexionar joelhos, articular descida",
    keyCues: "subir e descer com controle, não jogar peso no pescoço",
    visionMetrics: "elevação pélvica, flexão cervical, controle da descida",
    commonCompensations: "apoio excessivo cervical, velocidade alta, assimetria",
    redFlags: "osteoporose, cervicalgia importante, glaucoma não controlado",
    regression: "frog/leg circles",
    progression: "variações avançadas",
    displayName: "Short Spine",
  }),
  enrich({
    id: "ref_bridging",
    namePt: "Ponte no Reformer",
    nameEn: "Bridging on Reformer",
    category: "reformer",
    apparatus: "Reformer",
    level: "intermediario",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "decúbito dorsal pés na barra",
    primaryGoal: "extensão de quadril e controle pélvico",
    clinicalFocus: "glúteos, isquiotibiais, estabilidade lombar",
    setup: "pés na footbar, pelve neutra",
    execution: "elevar quadril e manter carrinho estável ou mover",
    keyCues: "joelhos alinhados, coluna longa, não compensar lombar",
    visionMetrics: "altura pélvica, deslocamento carrinho, valgo joelho",
    commonCompensations: "assimetria, hiperextensão lombar, cãibra",
    redFlags: "dor lombar/joelho",
    regression: "ponte no mat",
    progression: "ponte unilateral",
  }),
  enrich({
    id: "ref_long_stretch",
    namePt: "Alongamento longo",
    nameEn: "Long Stretch",
    category: "reformer",
    apparatus: "Reformer",
    level: "avancado",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "prancha com mãos na barra e pés no apoio",
    primaryGoal: "estabilidade global e controle escapular",
    clinicalFocus: "core, ombros, cadeia anterior",
    setup: "posição de prancha no Reformer",
    execution: "empurrar carrinho e retornar mantendo alinhamento",
    keyCues: "corpo em bloco, escápulas estáveis, abdome ativo",
    visionMetrics: "linha corporal, escápula, deslocamento carrinho",
    commonCompensations: "quadril cai, ombros sobem, cotovelos travam",
    redFlags: "dor ombro/punho/lombar, baixa tolerância",
    regression: "plank no mat",
    progression: "up stretch",
  }),
  enrich({
    id: "ref_scooter",
    namePt: "Patinete",
    nameEn: "Scooter",
    category: "reformer",
    apparatus: "Reformer",
    level: "intermediario",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "em pé/afundo com um pé no carrinho",
    primaryGoal: "controle unilateral de quadril e joelho",
    clinicalFocus: "glúteos, equilíbrio, alinhamento MMII",
    setup: "um pé no solo/plataforma e outro no carrinho",
    execution: "empurrar carrinho com perna móvel e retornar",
    keyCues: "pelve nivelada, joelho alinhado, tronco estável",
    visionMetrics: "valgo joelho, inclinação pélvica, controle retorno",
    commonCompensations: "tronco colapsa, pé roda, joelho entra",
    redFlags: "dor joelho/quadril, instabilidade",
    regression: "menor mola/amplitude",
    progression: "variação sem apoio",
  }),
  enrich({
    id: "ref_side_splits",
    namePt: "Aberturas laterais",
    nameEn: "Side Splits",
    category: "reformer",
    apparatus: "Reformer",
    level: "avancado",
    equipment: "Reformer",
    methodFamily: "Reformer",
    position: "em pé com pernas afastadas no carrinho/plataforma",
    primaryGoal: "controle frontal, adutores e estabilidade",
    clinicalFocus: "equilíbrio, força excêntrica, simetria",
    setup: "ficar em pé com segurança e molas adequadas",
    execution: "abrir e fechar pernas mantendo eixo",
    keyCues: "coluna alta, joelhos macios, peso distribuído",
    visionMetrics: "distância entre pés, simetria, oscilação tronco",
    commonCompensations: "travamento joelho, medo/rigidez, assimetria",
    redFlags: "risco de queda, dor adutor/joelho",
    regression: "standing hip abduction com apoio",
    progression: "variações com braços",
  }),
  enrich({
    id: "cad_roll_down",
    namePt: "Rolamento com barra",
    nameEn: "Roll Down Bar",
    category: "cadillac",
    apparatus: "Cadillac",
    level: "intermediario",
    equipment: "Cadillac",
    methodFamily: "Cadillac",
    position: "sentado segurando barra com molas",
    primaryGoal: "mobilidade de coluna e controle excêntrico",
    clinicalFocus: "flexão segmentar, respiração, core",
    setup: "sentar alto segurando barra",
    execution: "enrolar para trás e retornar segmentando coluna",
    keyCues: "usar molas como assistência, não como tranco",
    visionMetrics: "ângulo tronco, segmentação, simetria ombros",
    commonCompensations: "elevar ombros, colapsar peito, puxar com braços",
    redFlags: "dor lombar/cervical aguda",
    regression: "menor amplitude",
    progression: "roll up no mat",
    displayName: "Roll Down",
  }),
  enrich({
    id: "cad_leg_springs",
    namePt: "Molas de pernas",
    nameEn: "Leg Springs",
    category: "cadillac",
    apparatus: "Cadillac",
    level: "intermediario",
    equipment: "Cadillac",
    methodFamily: "Cadillac",
    position: "decúbito dorsal com molas nos pés",
    primaryGoal: "controle de quadril e pelve",
    clinicalFocus: "mobilidade, força de quadril, estabilidade lombo-pélvica",
    setup: "prender alças nos pés e ajustar molas",
    execution: "abrir, fechar, abaixar ou circular pernas",
    keyCues: "pelve pesada, trajetórias simétricas, controle retorno",
    visionMetrics: "trajetória pés, inclinação pélvica, amplitude",
    commonCompensations: "hiperlordose, assimetria, tensionar pescoço",
    redFlags: "dor lombar/virilha",
    regression: "menor amplitude",
    progression: "círculos maiores e coordenação",
  }),
  enrich({
    id: "cad_arm_springs",
    namePt: "Molas de braços",
    nameEn: "Arm Springs",
    category: "cadillac",
    apparatus: "Cadillac",
    level: "intermediario",
    equipment: "Cadillac",
    methodFamily: "Cadillac",
    position: "decúbito dorsal/sentado",
    primaryGoal: "força de membros superiores e controle escapular",
    clinicalFocus: "ombro, escápula, postura torácica",
    setup: "segurar alças com molas adequadas",
    execution: "realizar flexão/extensão/abdução controlada",
    keyCues: "ombros longe das orelhas, costelas controladas",
    visionMetrics: "elevação escapular, simetria braços, costelas",
    commonCompensations: "compensar cervical, abrir costelas, punhos rígidos",
    redFlags: "dor ombro aguda, parestesia",
    regression: "carga leve",
    progression: "sentado/ajoelhado",
  }),
  enrich({
    id: "cad_push_through",
    namePt: "Empurrar através da barra",
    nameEn: "Push Through",
    category: "cadillac",
    apparatus: "Cadillac",
    level: "intermediario",
    equipment: "Cadillac",
    methodFamily: "Cadillac",
    position: "sentado ou supino com barra",
    primaryGoal: "mobilidade coluna/ombro e controle de força",
    clinicalFocus: "cadeia anterior/posterior, coordenação",
    setup: "ajustar barra e molas com segurança",
    execution: "empurrar a barra com controle conforme variação",
    keyCues: "manter alinhamento, respeitar amplitude segura",
    visionMetrics: "amplitude ombro, coluna, controle barra",
    commonCompensations: "perder controle da barra, ombros elevados",
    redFlags: "risco se mola/barra mal ajustada",
    regression: "variação com menor mola",
    progression: "variações avançadas",
    displayName: "Push Through Bar",
  }),
  enrich({
    id: "cad_monkey",
    namePt: "Macaco",
    nameEn: "Monkey",
    category: "cadillac",
    apparatus: "Cadillac",
    level: "avancado",
    equipment: "Cadillac",
    methodFamily: "Cadillac",
    position: "supino com pés na barra",
    primaryGoal: "flexibilidade posterior e controle de coluna",
    clinicalFocus: "isquiotibiais, coluna, coordenação",
    setup: "deitar com pés na barra e mãos segurando apoio",
    execution: "estender pernas e articular coluna conforme variação",
    keyCues: "controle total, não forçar joelhos/cervical",
    visionMetrics: "ângulo joelho/quadril, flexão coluna, simetria",
    commonCompensations: "forçar alongamento, travar joelhos, tensão cervical",
    redFlags: "osteoporose, dor ciática irritável",
    regression: "alongamento assistido simples",
    progression: "monkey completo",
  }),
  enrich({
    id: "chair_footwork",
    namePt: "Trabalho de pés na Chair",
    nameEn: "Chair Footwork",
    category: "chair",
    apparatus: "Chair",
    level: "intermediario",
    equipment: "Wunda/Stability Chair",
    methodFamily: "Chair",
    position: "sentado com pés no pedal",
    primaryGoal: "força MMII e controle postural",
    clinicalFocus: "quadríceps, glúteos, alinhamento joelho-pé",
    setup: "sentar alto, pés no pedal",
    execution: "pressionar e controlar retorno do pedal",
    keyCues: "coluna alta, joelhos alinhados, retorno freado",
    visionMetrics: "ângulo joelho, simetria pedal, postura tronco",
    commonCompensations: "desabar tronco, joelhos entram, bater pedal",
    redFlags: "dor aguda joelho/quadril",
    regression: "menor mola/amplitude",
    progression: "unilateral",
    displayName: "Footwork",
  }),
  enrich({
    id: "chair_pike",
    namePt: "Pike na Chair",
    nameEn: "Pike",
    category: "chair",
    apparatus: "Chair",
    level: "avancado",
    equipment: "Wunda/Stability Chair",
    methodFamily: "Chair",
    position: "em pé sobre pedal/mãos na cadeira",
    primaryGoal: "força de core e flexão de tronco",
    clinicalFocus: "controle abdominal, ombros, equilíbrio",
    setup: "mãos apoiadas, pés no pedal",
    execution: "elevar pelve puxando pedal com controle",
    keyCues: "empurrar a cadeira, coluna em C, ombros estáveis",
    visionMetrics: "altura pélvica, escápula, simetria",
    commonCompensations: "usar impulso, colapsar ombros, perder pedal",
    redFlags: "dor punho/ombro/lombar, risco de queda",
    regression: "elephant no Reformer",
    progression: "pike avançado",
  }),
  enrich({
    id: "chair_mermaid",
    namePt: "Sereia na Chair",
    nameEn: "Mermaid on Chair",
    category: "chair",
    apparatus: "Chair",
    level: "intermediario",
    equipment: "Wunda/Stability Chair",
    methodFamily: "Chair",
    position: "sentado lateral",
    primaryGoal: "mobilidade lateral da coluna",
    clinicalFocus: "inclinação lateral, respiração, ombro",
    setup: "sentar lateral com mão no pedal",
    execution: "pressionar pedal inclinando tronco lateralmente",
    keyCues: "alongar costelas, manter pelve pesada",
    visionMetrics: "ângulo lateral, posição ombro, simetria",
    commonCompensations: "rodar tronco, elevar ombro, colapsar lombar",
    redFlags: "dor ombro/costela aguda",
    regression: "mermaid no mat",
    progression: "maior amplitude",
  }),
  enrich({
    id: "chair_step_up",
    namePt: "Subida na Chair",
    nameEn: "Step Up",
    category: "chair",
    apparatus: "Chair",
    level: "avancado",
    equipment: "Wunda/Stability Chair",
    methodFamily: "Chair",
    position: "em pé com um pé no pedal",
    primaryGoal: "força unilateral e equilíbrio",
    clinicalFocus: "glúteo, quadríceps, controle frontal",
    setup: "um pé no pedal, mãos em apoio se necessário",
    execution: "pressionar pedal e controlar retorno/subida",
    keyCues: "joelho acompanha pé, tronco alto, pelve nivelada",
    visionMetrics: "valgo dinâmico, inclinação tronco, controle pedal",
    commonCompensations: "joelho entra, impulso, perda equilíbrio",
    redFlags: "risco de queda, dor joelho/quadril",
    regression: "apoio manual",
    progression: "sem apoio/variações",
  }),
  enrich({
    id: "barrel_swan",
    namePt: "Cisne no Barrel",
    nameEn: "Swan on Barrel",
    category: "barrel",
    apparatus: "Barrel",
    level: "intermediario",
    equipment: "Ladder Barrel/Spine Corrector",
    methodFamily: "Barrel",
    position: "decúbito ventral sobre barrel",
    primaryGoal: "extensão torácica e cadeia posterior",
    clinicalFocus: "mobilidade coluna, glúteos, controle lombar",
    setup: "posicionar tronco sobre barrel com apoio seguro",
    execution: "realizar extensão controlada do tronco",
    keyCues: "alongar pelo topo da cabeça, distribuir extensão",
    visionMetrics: "ângulo extensão, cervical, simetria escápulas",
    commonCompensations: "hiperextensão lombar, ombros tensos",
    redFlags: "dor lombar/cervical",
    regression: "mini swan no mat",
    progression: "swan completo",
    displayName: "Swan/Backbend",
  }),
  enrich({
    id: "barrel_side_bend",
    namePt: "Inclinação lateral no Barrel",
    nameEn: "Side Bend on Barrel",
    category: "barrel",
    apparatus: "Barrel",
    level: "intermediario",
    equipment: "Ladder Barrel",
    methodFamily: "Barrel",
    position: "decúbito lateral",
    primaryGoal: "mobilidade lateral e controle oblíquo",
    clinicalFocus: "cadeia lateral, coluna torácica, quadril",
    setup: "apoiar lateralmente no barrel, pés fixos",
    execution: "inclinar e retornar lateralmente com controle",
    keyCues: "crescer pelas costelas, evitar rotação",
    visionMetrics: "ângulo inclinação, alinhamento tronco, quadril",
    commonCompensations: "rodar tronco, tensionar pescoço",
    redFlags: "dor lombar/costal aguda",
    regression: "side bend no mat",
    progression: "amplitude maior",
  }),
  enrich({
    id: "barrel_horseback",
    namePt: "Cavalo no Barrel",
    nameEn: "Horseback",
    category: "barrel",
    apparatus: "Barrel",
    level: "avancado",
    equipment: "Ladder Barrel/Arc Barrel",
    methodFamily: "Barrel",
    position: "sentado em flexão",
    primaryGoal: "controle de flexão de coluna e adutores",
    clinicalFocus: "core, cadeia posterior, coordenação",
    setup: "sentar no barrel com pernas organizadas",
    execution: "arredondar coluna e sustentar controle",
    keyCues: "manter curva uniforme, ombros soltos",
    visionMetrics: "curvatura coluna, estabilidade, simetria pernas",
    commonCompensations: "colapsar cervical, prender respiração",
    redFlags: "osteoporose importante, dor lombar aguda",
    regression: "spine stretch",
    progression: "horseback com carga/variação",
  }),
  enrich({
    id: "access_magic_circle_adduction",
    namePt: "Adução com círculo",
    nameEn: "Magic Circle Adduction",
    category: "funcional",
    apparatus: "—",
    level: "basico",
    equipment: "Magic Circle",
    methodFamily: "Acessórios",
    position: "sentado ou supino",
    primaryGoal: "ativação adutores e controle pélvico",
    clinicalFocus: "quadril, assoalho pélvico indireto, simetria",
    setup: "posicionar círculo entre joelhos ou tornozelos",
    execution: "comprimir e soltar com controle",
    keyCues: "respirar, manter pelve neutra, evitar tensão cervical",
    visionMetrics: "simetria joelhos, ritmo, postura",
    commonCompensations: "prender respiração, inclinar tronco",
    redFlags: "dor púbica/quadril",
    regression: "menor pressão",
    progression: "combinar com ponte",
    displayName: "Adução com Magic Circle",
  }),
  enrich({
    id: "access_band_row",
    namePt: "Remada com faixa",
    nameEn: "Band Row",
    category: "funcional",
    apparatus: "—",
    level: "basico",
    equipment: "Faixa elástica",
    methodFamily: "Acessórios",
    position: "sentado ou em pé",
    primaryGoal: "controle escapular e força dorsal",
    clinicalFocus: "ombro, postura torácica",
    setup: "fixar faixa à frente ou segurar com pés",
    execution: "tracionar cotovelos para trás com escápulas controladas",
    keyCues: "pescoço longo, peito aberto, costelas estáveis",
    visionMetrics: "simetria braços, elevação ombros, postura",
    commonCompensations: "elevar ombros, hiperextender lombar",
    redFlags: "dor ombro, parestesia",
    regression: "faixa leve",
    progression: "ajoelhado/em pé com desafio",
    displayName: "Remada com faixa",
  }),
  enrich({
    id: "access_ball_bridge",
    namePt: "Ponte na bola",
    nameEn: "Bridge on Ball",
    category: "funcional",
    apparatus: "—",
    level: "intermediario",
    equipment: "Bola suíça",
    methodFamily: "Acessórios",
    position: "decúbito dorsal pés na bola",
    primaryGoal: "estabilidade lombo-pélvica e posterior de coxa",
    clinicalFocus: "equilíbrio, glúteos, isquiotibiais",
    setup: "pés ou panturrilhas apoiadas na bola",
    execution: "elevar quadril controlando instabilidade",
    keyCues: "pelve nivelada, bola quieta, joelhos alinhados",
    visionMetrics: "oscilação bola, altura pelve, simetria",
    commonCompensations: "perder alinhamento, cãibra, lombar arqueada",
    redFlags: "risco queda, dor lombar",
    regression: "ponte no mat",
    progression: "curl de isquios na bola",
    displayName: "Ponte na bola",
  }),
  enrich({
    id: "access_foam_roller_dead_bug",
    namePt: "Dead bug no rolo",
    nameEn: "Foam Roller Dead Bug",
    category: "funcional",
    apparatus: "—",
    level: "intermediario",
    equipment: "Foam roller",
    methodFamily: "Acessórios",
    position: "decúbito dorsal sobre rolo",
    primaryGoal: "controle anti-rotação e estabilidade",
    clinicalFocus: "core, equilíbrio, dissociação MMSS/MMII",
    setup: "deitar longitudinalmente sobre rolo",
    execution: "alternar braços/pernas mantendo tronco estável",
    keyCues: "respiração calma, pelve e costelas controladas",
    visionMetrics: "oscilação tronco, simetria, amplitude membros",
    commonCompensations: "cair para lado, prender respiração",
    redFlags: "baixa tolerância ao equilíbrio",
    regression: "cabeça apoiada no mat",
    progression: "alavancas longas",
    displayName: "Dead bug no foam roller",
  }),
  enrich({
    id: "clinical_sit_to_stand",
    namePt: "Senta e levanta inspirado no Pilates",
    nameEn: "Pilates-based Sit to Stand",
    category: "funcional",
    apparatus: "—",
    level: "basico",
    equipment: "Cadeira/Mat",
    methodFamily: "Clínico funcional",
    position: "sentado para em pé",
    primaryGoal: "função, força e controle de MMII",
    clinicalFocus: "idosos, pós-operatório, equilíbrio",
    setup: "sentar na borda da cadeira com pés paralelos",
    execution: "levantar e sentar com controle",
    keyCues: "nariz sobre os dedos, joelhos alinhados, coluna longa",
    visionMetrics: "tempo, simetria, valgo, inclinação tronco",
    commonCompensations: "usar impulso, desabar no assento, assimetria",
    redFlags: "dor torácica, tontura, queda",
    regression: "apoio de mãos",
    progression: "sem mãos/carga",
    displayName: "Sentar e levantar",
  }),
  enrich({
    id: "clinical_wall_roll_down",
    namePt: "Rolamento na parede",
    nameEn: "Wall Roll Down",
    category: "funcional",
    apparatus: "—",
    level: "basico",
    equipment: "Parede",
    methodFamily: "Clínico contemporâneo",
    position: "em pé com apoio na parede",
    primaryGoal: "consciência postural e mobilidade",
    clinicalFocus: "coluna, respiração, relaxamento",
    setup: "ficar com costas próximas à parede",
    execution: "puxar queixo e enrolar coluna lentamente",
    keyCues: "soltar ombros, respirar, respeitar amplitude",
    visionMetrics: "curvatura coluna, simetria, amplitude",
    commonCompensations: "flexionar só cervical, travar joelhos",
    redFlags: "tontura, osteoporose sem adaptação",
    regression: "menor amplitude",
    progression: "sem parede",
    displayName: "Rolamento na parede",
  }),
  enrich({
    id: "clinical_balance_reach",
    namePt: "Alcance em equilíbrio",
    nameEn: "Balance Reach",
    category: "funcional",
    apparatus: "—",
    level: "intermediario",
    equipment: "Sem equipamento",
    methodFamily: "Clínico funcional",
    position: "em pé unilateral ou semi-tandem",
    primaryGoal: "equilíbrio e controle postural",
    clinicalFocus: "prevenção quedas, tornozelo/quadril",
    setup: "ficar em base segura próxima a apoio",
    execution: "alcançar braços ou perna sem perder alinhamento",
    keyCues: "olhar estável, quadril nivelado, joelho macio",
    visionMetrics: "oscilação, tempo apoio, alinhamento joelho-pé",
    commonCompensations: "prender respiração, agarrar dedos, compensar tronco",
    redFlags: "risco de queda alto",
    regression: "apoio bilateral",
    progression: "unipodal com alcance multidirecional",
    displayName: "Alcance em equilíbrio",
  }),
  enrich({
    id: "clinical_breathing_rib_cage",
    namePt: "Respiração costal orientada",
    nameEn: "Lateral Breathing",
    category: "funcional",
    apparatus: "—",
    level: "basico",
    equipment: "Mat",
    methodFamily: "Clínico contemporâneo",
    position: "supino/sentado",
    primaryGoal: "coordenação respiratória e controle costal",
    clinicalFocus: "educação respiratória, postura, dor",
    setup: "posicionar mãos nas costelas laterais",
    execution: "inspirar expandindo lateralmente e expirar fechando costelas",
    keyCues: "pescoço relaxado, sem elevar ombros",
    visionMetrics: "elevação ombros, movimento torácico, ritmo",
    commonCompensations: "respiração apical, tensão cervical",
    redFlags: "dispneia, dor torácica, tontura",
    regression: "posição confortável",
    progression: "integrar com movimento",
    displayName: "Respiração costal (Lateral Breathing)",
  }),
];

// ---------------------------------------------------------------------------
// Legacy items (basic shape) — preservam o repertório completo já usado pelo
// picker e pela avaliação dinâmica. Deduplicados contra ENRICHED_ITEMS por
// (categoria + nome normalizado).
// ---------------------------------------------------------------------------

function funcionalBasic(name: string): ExerciseCatalogItem {
  return { name, category: "funcional", apparatus: "—", level: null };
}

function pilatesBasic(
  category: ExerciseCategory,
  apparatus: Apparatus,
  name: string,
  level: ExerciseLevel,
): ExerciseCatalogItem {
  return { name, category, apparatus, level };
}

const LEGACY_ITEMS: ExerciseCatalogItem[] = [
  // FUNCIONAL — usados por movement_results / avaliacao-dinamica.
  funcionalBasic("Agachamento"),
  funcionalBasic("Ponte"),
  funcionalBasic("Lunge"),
  funcionalBasic("Apoio unipodal"),
  funcionalBasic("Flexão de tronco"),
  funcionalBasic("Elevação de membros superiores"),
  funcionalBasic("Movimento livre"),

  // MAT — complementares ao repertório enriquecido.
  pilatesBasic("mat", "Solo", "Single Leg Circles", "basico"),
  pilatesBasic("mat", "Solo", "Rolling Like a Ball", "basico"),
  pilatesBasic("mat", "Solo", "Single Leg Kick", "basico"),
  pilatesBasic("mat", "Solo", "Shoulder Bridge", "basico"),
  pilatesBasic("mat", "Solo", "Spine Twist", "basico"),
  pilatesBasic("mat", "Solo", "Roll Over", "intermediario"),
  pilatesBasic("mat", "Solo", "Open Leg Rocker", "intermediario"),
  pilatesBasic("mat", "Solo", "Corkscrew", "intermediario"),
  pilatesBasic("mat", "Solo", "Saw", "intermediario"),
  pilatesBasic("mat", "Solo", "Double Leg Kick", "intermediario"),
  pilatesBasic("mat", "Solo", "Neck Pull", "intermediario"),
  pilatesBasic("mat", "Solo", "Scissors", "intermediario"),
  pilatesBasic("mat", "Solo", "Bicycle", "intermediario"),
  pilatesBasic("mat", "Solo", "Jack Knife", "intermediario"),
  pilatesBasic("mat", "Solo", "Teaser", "intermediario"),
  pilatesBasic("mat", "Solo", "Leg Pull Front", "intermediario"),
  pilatesBasic("mat", "Solo", "Leg Pull Back", "intermediario"),
  pilatesBasic("mat", "Solo", "Side Kick Kneeling", "intermediario"),
  pilatesBasic("mat", "Solo", "Swan Dive", "avancado"),
  pilatesBasic("mat", "Solo", "Hip Twist", "avancado"),
  pilatesBasic("mat", "Solo", "Side Bend", "avancado"),
  pilatesBasic("mat", "Solo", "Boomerang", "avancado"),
  pilatesBasic("mat", "Solo", "Seal", "avancado"),
  pilatesBasic("mat", "Solo", "Crab", "avancado"),
  pilatesBasic("mat", "Solo", "Rocking", "avancado"),
  pilatesBasic("mat", "Solo", "Control Balance", "avancado"),
  pilatesBasic("mat", "Solo", "Push Up", "avancado"),
  { name: "Exercício livre", category: "mat", apparatus: "Solo", level: null },

  // REFORMER
  pilatesBasic("reformer", "Reformer", "Overhead", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Coordination", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Rowing (série)", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Swan (Long Box)", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Pulling Straps", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Backstroke", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Teaser (Long Box)", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Down Stretch", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Up Stretch", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Elephant", "basico"),
  pilatesBasic("reformer", "Reformer", "Stomach Massage (série)", "basico"),
  pilatesBasic("reformer", "Reformer", "Tendon Stretch", "avancado"),
  pilatesBasic("reformer", "Reformer", "Short Box (série)", "basico"),
  pilatesBasic("reformer", "Reformer", "Long Spine", "avancado"),
  pilatesBasic("reformer", "Reformer", "Semi-Circle", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Chest Expansion", "basico"),
  pilatesBasic("reformer", "Reformer", "Thigh Stretch", "basico"),
  pilatesBasic("reformer", "Reformer", "Knee Stretches", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Running", "basico"),
  pilatesBasic("reformer", "Reformer", "Pelvic Lift", "intermediario"),
  pilatesBasic("reformer", "Reformer", "Front Splits", "avancado"),
  pilatesBasic("reformer", "Reformer", "Long Back Stretch", "avancado"),
  pilatesBasic("reformer", "Reformer", "Snake/Twist", "avancado"),
  pilatesBasic("reformer", "Reformer", "Balance Control", "avancado"),
  pilatesBasic("reformer", "Reformer", "Knees Off", "avancado"),
  { name: "Exercício livre", category: "reformer", apparatus: "Reformer", level: null },

  // CADILLAC
  pilatesBasic("cadillac", "Cadillac", "Tower", "intermediario"),
  pilatesBasic("cadillac", "Cadillac", "Breathing", "basico"),
  pilatesBasic("cadillac", "Cadillac", "Airplane", "avancado"),
  pilatesBasic("cadillac", "Cadillac", "Parakeet", "avancado"),
  pilatesBasic("cadillac", "Cadillac", "Half Hang", "avancado"),
  pilatesBasic("cadillac", "Cadillac", "Flying Eagle", "avancado"),
  pilatesBasic("cadillac", "Cadillac", "Hanging", "avancado"),
  { name: "Exercício livre", category: "cadillac", apparatus: "Cadillac", level: null },

  // CHAIR
  pilatesBasic("chair", "Chair", "Pumping (uma/duas pernas)", "basico"),
  pilatesBasic("chair", "Chair", "Push Down", "intermediario"),
  pilatesBasic("chair", "Chair", "Push Up", "intermediario"),
  pilatesBasic("chair", "Chair", "Swan", "intermediario"),
  pilatesBasic("chair", "Chair", "Teaser", "intermediario"),
  pilatesBasic("chair", "Chair", "Going Up Front", "avancado"),
  pilatesBasic("chair", "Chair", "Mountain Climb", "avancado"),
  pilatesBasic("chair", "Chair", "Spine Stretch", "intermediario"),
  pilatesBasic("chair", "Chair", "Twist", "intermediario"),
  pilatesBasic("chair", "Chair", "Tendon Stretch", "intermediario"),
  pilatesBasic("chair", "Chair", "Washer Woman", "intermediario"),
  { name: "Exercício livre", category: "chair", apparatus: "Chair", level: null },

  // BARREL
  pilatesBasic("barrel", "Barrel", "Short Box", "intermediario"),
  pilatesBasic("barrel", "Barrel", "Side Stretch", "intermediario"),
  pilatesBasic("barrel", "Barrel", "Hip Circles", "intermediario"),
  pilatesBasic("barrel", "Barrel", "Ballet Stretches", "intermediario"),
  pilatesBasic("barrel", "Barrel", "The Hundred", "basico"),
  pilatesBasic("barrel", "Barrel", "Scissors", "intermediario"),
  pilatesBasic("barrel", "Barrel", "Bicycle", "intermediario"),
  pilatesBasic("barrel", "Barrel", "Teaser", "intermediario"),
  { name: "Exercício livre", category: "barrel", apparatus: "Barrel", level: null },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function dedupKey(it: ExerciseCatalogItem): string {
  return `${it.category}::${normalize(it.name)}`;
}

const enrichedKeys = new Set(ENRICHED_ITEMS.map(dedupKey));
const legacyFiltered = LEGACY_ITEMS.filter((it) => !enrichedKeys.has(dedupKey(it)));

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [...ENRICHED_ITEMS, ...legacyFiltered];

export function isPilatesCategory(c: ExerciseCategory): boolean {
  return c !== "funcional";
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
      const parts: string[] = [
        it.name,
        it.namePt ?? "",
        it.nameEn ?? "",
        CATEGORY_LABEL[it.category],
        it.apparatus,
        it.equipment ?? "",
        it.methodFamily ?? "",
        it.primaryGoal ?? "",
        it.clinicalFocus ?? "",
        (it.tags ?? []).join(" "),
      ];
      const hay = normalize(parts.join(" "));
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
