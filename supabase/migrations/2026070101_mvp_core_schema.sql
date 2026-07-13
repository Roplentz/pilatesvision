-- PilatesVision MVP Core Schema
-- Sprint 2.1: Supabase infrastructure

create extension if not exists "pgcrypto";

-- =========================
-- Core domain
-- =========================

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  email text,
  phone text,
  address text,
  logo_url text,
  plan text not null default 'starter',
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reconcile the legacy clinics table created by earlier migrations. The
-- CREATE TABLE IF NOT EXISTS above does not add columns to an existing table.
alter table public.clinics
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.clinics
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  crefito text,
  specialties text[] default '{}',
  photo_url text,
  signature_url text,
  role text not null default 'physiotherapist',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  name text not null,
  email text,
  phone text,
  birth_date date,
  sex text,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  occupation text,
  goals text,
  clinical_history text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Assessment domain
-- =========================

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  assessment_type text not null default 'postural_photo',
  status text not null default 'draft',
  subjective_notes text,
  clinical_notes text,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_media (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  media_type text not null default 'photo',
  view_type text,
  original_url text not null,
  processed_url text,
  storage_bucket text not null default 'assessment-media',
  storage_path text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.pose_landmarks (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  media_id uuid references public.assessment_media(id) on delete cascade,
  engine text not null default 'mediapipe',
  engine_version text,
  landmarks jsonb not null,
  confidence numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists public.biomechanical_metrics (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  media_id uuid references public.assessment_media(id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  value numeric,
  unit text,
  side text,
  confidence numeric(5,4),
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  posture_score numeric(5,2),
  mobility_score numeric(5,2),
  stability_score numeric(5,2),
  symmetry_score numeric(5,2),
  motor_control_score numeric(5,2),
  movement_quality_score numeric(5,2),
  progress_score numeric(5,2),
  global_clinical_score numeric(5,2),
  scoring_model_version text not null default 'mvp-0.1',
  explanation jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_insights (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  insight_type text not null,
  title text not null,
  description text not null,
  confidence numeric(5,4),
  severity text,
  evidence_refs jsonb not null default '[]',
  suggested_follow_up jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- =========================
-- Reports domain
-- =========================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  report_type text not null default 'postural_assessment',
  pdf_url text,
  version text not null default 'mvp-0.1',
  verification_hash text,
  status text not null default 'generated',
  created_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================

create index if not exists idx_professionals_clinic_id on public.professionals(clinic_id);
create index if not exists idx_patients_clinic_id on public.patients(clinic_id);
create index if not exists idx_patients_professional_id on public.patients(professional_id);
create index if not exists idx_assessments_clinic_id on public.assessments(clinic_id);
create index if not exists idx_assessments_patient_id on public.assessments(patient_id);
create index if not exists idx_assessment_media_assessment_id on public.assessment_media(assessment_id);
create index if not exists idx_pose_landmarks_assessment_id on public.pose_landmarks(assessment_id);
create index if not exists idx_biomechanical_metrics_assessment_id on public.biomechanical_metrics(assessment_id);
create index if not exists idx_clinical_scores_assessment_id on public.clinical_scores(assessment_id);
create index if not exists idx_reports_assessment_id on public.reports(assessment_id);
