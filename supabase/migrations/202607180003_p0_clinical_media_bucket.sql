-- P0 clinical media bootstrap.
-- The application stores assessment media and finalized report PDFs under a
-- single private bucket using the first path segment as the clinic id.

INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-media', 'clinical-media', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false;

DROP POLICY IF EXISTS clinical_media_sel ON storage.objects;
DROP POLICY IF EXISTS clinical_media_ins ON storage.objects;
DROP POLICY IF EXISTS clinical_media_upd ON storage.objects;
DROP POLICY IF EXISTS clinical_media_del ON storage.objects;

CREATE POLICY clinical_media_sel
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinical-media'
  AND (storage.foldername(name))[1] = public.current_user_clinic_id()::text
);

CREATE POLICY clinical_media_ins
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinical-media'
  AND (storage.foldername(name))[1] = public.current_user_clinic_id()::text
);

CREATE POLICY clinical_media_upd
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinical-media'
  AND (storage.foldername(name))[1] = public.current_user_clinic_id()::text
)
WITH CHECK (
  bucket_id = 'clinical-media'
  AND (storage.foldername(name))[1] = public.current_user_clinic_id()::text
);

CREATE POLICY clinical_media_del
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinical-media'
  AND (storage.foldername(name))[1] = public.current_user_clinic_id()::text
);
