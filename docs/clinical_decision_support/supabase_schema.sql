-- PilatesVision | Clinical decision support schema
-- Versao inicial para catalogo de exercicios, metodos e regras.
-- Este arquivo e uma proposta de base. Ajustar nomes e RLS conforme schema real do projeto.

create table if not exists public.pilates_methods (
  id text primary key,
  name text not null,
  description text not null,
  clinical_use text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilates_exercises (
  id text primary key,
  name_pt text not null,
  name_en text,
  method_family text,
  equipment text not null,
  level text not null check (level in ('iniciante', 'iniciante-intermediario', 'intermediario', 'intermediário', 'avançado', 'avancado')),
  position text,
  primary_goal text,
  clinical_focus text,
  setup text,
  execution text,
  key_cues text,
  vision_metrics text,
  common_compensations text,
  red_flags text,
  regression text,
  progression text,
  image_ref text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilates_exercise_rules (
  id uuid primary key default gen_random_uuid(),
  exercise_id text not null references public.pilates_exercises(id) on delete cascade,
  rule_type text not null check (rule_type in ('cue', 'regression', 'progression', 'red_flag', 'metric', 'contraindication_relative')),
  condition text not null,
  recommendation text not null,
  support_level integer not null default 1 check (support_level between 0 and 3),
  requires_professional_confirmation boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pilates_exercise_images (
  id uuid primary key default gen_random_uuid(),
  exercise_id text not null references public.pilates_exercises(id) on delete cascade,
  image_ref text not null,
  image_type text not null default 'svg_reference',
  alt_text text not null,
  source_kind text not null default 'own_schematic',
  created_at timestamptz not null default now()
);

create table if not exists public.pilates_analysis_templates (
  id uuid primary key default gen_random_uuid(),
  exercise_id text not null references public.pilates_exercises(id) on delete cascade,
  camera_view text not null check (camera_view in ('frontal', 'sagital', 'posterior', 'superior', 'multi_view')),
  landmarks_required text[] not null default '{}',
  metrics_json jsonb not null default '{}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indices uteis
create index if not exists idx_pilates_exercises_equipment on public.pilates_exercises(equipment);
create index if not exists idx_pilates_exercises_level on public.pilates_exercises(level);
create index if not exists idx_pilates_exercises_family on public.pilates_exercises(method_family);
create index if not exists idx_pilates_rules_exercise on public.pilates_exercise_rules(exercise_id);

-- RLS: habilitar quando integrado a clinics/profiles.
-- alter table public.pilates_methods enable row level security;
-- alter table public.pilates_exercises enable row level security;
-- alter table public.pilates_exercise_rules enable row level security;
-- alter table public.pilates_exercise_images enable row level security;
-- alter table public.pilates_analysis_templates enable row level security;

-- Diretriz de seguranca:
-- O catalogo pode ser global/leitura para profissionais autenticados.
-- Prescricoes e analises de pacientes devem continuar vinculadas a clinic_id e protegidas por RLS.
