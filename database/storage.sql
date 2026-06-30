-- PilatesVision Supabase Storage setup
-- Run after project creation in Supabase SQL editor if storage schema is available.

insert into storage.buckets (id, name, public)
values ('clinical-media', 'clinical-media', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated-reports', 'generated-reports', false)
on conflict (id) do nothing;

-- Recommended storage path pattern:
-- clinics/{clinic_id}/patients/{patient_id}/assessments/{assessment_id}/photos/{file}
-- clinics/{clinic_id}/patients/{patient_id}/assessments/{assessment_id}/videos/{file}
-- clinics/{clinic_id}/patients/{patient_id}/assessments/{assessment_id}/reports/{file}

-- Storage policies must restrict access by authenticated users from same clinic.
-- Final policy should validate path clinic_id against the user's profile clinic_id.
