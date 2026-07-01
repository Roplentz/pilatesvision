-- PilatesVision MVP Storage Setup
-- Sprint 2.1: buckets and storage policies

-- Buckets
insert into storage.buckets (id, name, public)
values
  ('assessment-media', 'assessment-media', false),
  ('report-pdfs', 'report-pdfs', false),
  ('clinic-assets', 'clinic-assets', true)
on conflict (id) do nothing;

-- Storage policies
-- Path convention:
-- assessment-media/{clinic_id}/{patient_id}/{assessment_id}/{filename}
-- report-pdfs/{clinic_id}/{patient_id}/{assessment_id}/{filename}
-- clinic-assets/{clinic_id}/{filename}

create policy "assessment_media_select_by_clinic_path"
on storage.objects
for select
using (
  bucket_id = 'assessment-media'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "assessment_media_insert_by_clinic_path"
on storage.objects
for insert
with check (
  bucket_id = 'assessment-media'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "assessment_media_update_by_clinic_path"
on storage.objects
for update
using (
  bucket_id = 'assessment-media'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'assessment-media'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "report_pdfs_select_by_clinic_path"
on storage.objects
for select
using (
  bucket_id = 'report-pdfs'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "report_pdfs_insert_by_clinic_path"
on storage.objects
for insert
with check (
  bucket_id = 'report-pdfs'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "clinic_assets_public_select"
on storage.objects
for select
using (bucket_id = 'clinic-assets');

create policy "clinic_assets_insert_by_clinic_path"
on storage.objects
for insert
with check (
  bucket_id = 'clinic-assets'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);

create policy "clinic_assets_update_by_clinic_path"
on storage.objects
for update
using (
  bucket_id = 'clinic-assets'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'clinic-assets'
  and public.user_has_clinic_access((storage.foldername(name))[1]::uuid)
);
