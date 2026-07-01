-- PilatesVision MVP RLS Policies
-- Sprint 2.1: clinic-scoped data security

-- Enable RLS
alter table public.clinics enable row level security;
alter table public.professionals enable row level security;
alter table public.patients enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_media enable row level security;
alter table public.pose_landmarks enable row level security;
alter table public.biomechanical_metrics enable row level security;
alter table public.clinical_scores enable row level security;
alter table public.clinical_insights enable row level security;
alter table public.reports enable row level security;

-- Helper: current user belongs to clinic
create or replace function public.user_has_clinic_access(target_clinic_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clinics c
    where c.id = target_clinic_id
      and c.owner_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.professionals p
    where p.clinic_id = target_clinic_id
      and p.user_id = auth.uid()
      and p.is_active = true
  );
$$;

-- Clinics
create policy "clinics_select_own" on public.clinics
for select using (owner_user_id = auth.uid() or public.user_has_clinic_access(id));

create policy "clinics_insert_own" on public.clinics
for insert with check (owner_user_id = auth.uid());

create policy "clinics_update_own" on public.clinics
for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

-- Professionals
create policy "professionals_select_clinic" on public.professionals
for select using (public.user_has_clinic_access(clinic_id));

create policy "professionals_insert_clinic_owner" on public.professionals
for insert with check (public.user_has_clinic_access(clinic_id));

create policy "professionals_update_clinic" on public.professionals
for update using (public.user_has_clinic_access(clinic_id)) with check (public.user_has_clinic_access(clinic_id));

-- Patients
create policy "patients_select_clinic" on public.patients
for select using (public.user_has_clinic_access(clinic_id));

create policy "patients_insert_clinic" on public.patients
for insert with check (public.user_has_clinic_access(clinic_id));

create policy "patients_update_clinic" on public.patients
for update using (public.user_has_clinic_access(clinic_id)) with check (public.user_has_clinic_access(clinic_id));

-- Assessments
create policy "assessments_select_clinic" on public.assessments
for select using (public.user_has_clinic_access(clinic_id));

create policy "assessments_insert_clinic" on public.assessments
for insert with check (public.user_has_clinic_access(clinic_id));

create policy "assessments_update_clinic" on public.assessments
for update using (public.user_has_clinic_access(clinic_id)) with check (public.user_has_clinic_access(clinic_id));

-- Assessment media
create policy "assessment_media_select_clinic" on public.assessment_media
for select using (public.user_has_clinic_access(clinic_id));

create policy "assessment_media_insert_clinic" on public.assessment_media
for insert with check (public.user_has_clinic_access(clinic_id));

create policy "assessment_media_update_clinic" on public.assessment_media
for update using (public.user_has_clinic_access(clinic_id)) with check (public.user_has_clinic_access(clinic_id));

-- Derived assessment tables use parent assessment access
create policy "pose_landmarks_select_assessment" on public.pose_landmarks
for select using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "pose_landmarks_insert_assessment" on public.pose_landmarks
for insert with check (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "biomechanical_metrics_select_assessment" on public.biomechanical_metrics
for select using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "biomechanical_metrics_insert_assessment" on public.biomechanical_metrics
for insert with check (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "clinical_scores_select_assessment" on public.clinical_scores
for select using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "clinical_scores_insert_assessment" on public.clinical_scores
for insert with check (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "clinical_insights_select_assessment" on public.clinical_insights
for select using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

create policy "clinical_insights_insert_assessment" on public.clinical_insights
for insert with check (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and public.user_has_clinic_access(a.clinic_id)
  )
);

-- Reports
create policy "reports_select_clinic" on public.reports
for select using (public.user_has_clinic_access(clinic_id));

create policy "reports_insert_clinic" on public.reports
for insert with check (public.user_has_clinic_access(clinic_id));

create policy "reports_update_clinic" on public.reports
for update using (public.user_has_clinic_access(clinic_id)) with check (public.user_has_clinic_access(clinic_id));
