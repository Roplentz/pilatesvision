-- PilatesVision / FisioHub Core
-- Initial clinical schema for Supabase PostgreSQL

create extension if not exists "pgcrypto";

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  document_number text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  full_name text not null,
  role text not null default 'physiotherapist' check (role in ('admin','manager','physiotherapist','intern','patient')),
  crefito text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  full_name text not null,
  birth_date date,
  cpf text,
  email text,
  phone text,
  sex text check (sex in ('female','male','other','not_informed')),
  occupation text,
  main_goal text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  consent_lgpd boolean not null default false,
  consent_image_use boolean not null default false,
  consent_ai_support boolean not null default false,
  consent_text text,
  accepted_at timestamptz,
  ip_address text,
  responsible_professional_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.anamneses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  professional_id uuid references public.profiles(id) on delete set null,
  chief_complaint text,
  clinical_history text,
  comorbidities text,
  medications text,
  contraindications text,
  physical_activity_level text,
  functional_goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  professional_id uuid references public.profiles(id) on delete set null,
  assessment_type text not null check (assessment_type in ('postural_static','dynamic','pilates_exercise','follow_up')),
  status text not null default 'draft' check (status in ('draft','processing','review','completed','archived')),
  title text,
  clinical_notes text,
  assessment_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pain_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  body_region text not null,
  side text check (side in ('right','left','bilateral','central','not_applicable')),
  score integer not null check (score between 0 and 10),
  context text,
  created_at timestamptz not null default now()
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  media_type text not null check (media_type in ('photo','video','report','other')),
  view_type text check (view_type in ('front','back','left_side','right_side','exercise','other')),
  storage_bucket text not null default 'clinical-media',
  storage_path text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.pose_landmarks (
  id uuid primary key default gen_random_uuid(),
  media_file_id uuid not null references public.media_files(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  engine text not null default 'mediapipe',
  engine_version text,
  frame_number integer,
  timestamp_ms integer,
  landmarks jsonb not null,
  confidence numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists public.movement_metrics (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  metric_name text not null,
  body_region text,
  side text check (side in ('right','left','bilateral','central','not_applicable')),
  value numeric,
  unit text,
  confidence numeric(5,4),
  source_landmark_id uuid references public.pose_landmarks(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_findings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  finding_type text not null,
  body_region text,
  severity text check (severity in ('low','moderate','high','critical','not_classified')),
  description text not null,
  generated_by text not null default 'professional' check (generated_by in ('professional','rule_engine','ai_engine')),
  professional_validated boolean not null default false,
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  target_regions text[],
  contraindications text,
  instructions text,
  evidence_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete set null,
  exercise_id uuid references public.exercise_library(id) on delete set null,
  professional_id uuid references public.profiles(id) on delete set null,
  session_date timestamptz not null default now(),
  performance_notes text,
  pain_before integer check (pain_before between 0 and 10),
  pain_after integer check (pain_after between 0 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  professional_id uuid references public.profiles(id) on delete set null,
  title text not null,
  summary text,
  report_json jsonb,
  pdf_storage_path text,
  status text not null default 'draft' check (status in ('draft','review','final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinical_events (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references public.clinics(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
