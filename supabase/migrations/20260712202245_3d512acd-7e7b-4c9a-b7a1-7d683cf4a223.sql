
-- 1. Storage: clinical-media (bucket privado já existente).
-- Recria policies com escopo TO authenticated e adiciona DELETE ausente.
-- Predicado: primeiro segmento do path deve ser a clinic_id do usuário.
DROP POLICY IF EXISTS clinical_media_sel ON storage.objects;
DROP POLICY IF EXISTS clinical_media_ins ON storage.objects;
DROP POLICY IF EXISTS clinical_media_upd ON storage.objects;
DROP POLICY IF EXISTS clinical_media_del ON storage.objects;

CREATE POLICY clinical_media_sel ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'clinical-media'
    AND (storage.foldername(name))[1] = (public.current_user_clinic_id())::text
  );

CREATE POLICY clinical_media_ins ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinical-media'
    AND (storage.foldername(name))[1] = (public.current_user_clinic_id())::text
  );

CREATE POLICY clinical_media_upd ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'clinical-media'
    AND (storage.foldername(name))[1] = (public.current_user_clinic_id())::text
  )
  WITH CHECK (
    bucket_id = 'clinical-media'
    AND (storage.foldername(name))[1] = (public.current_user_clinic_id())::text
  );

CREATE POLICY clinical_media_del ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'clinical-media'
    AND (storage.foldername(name))[1] = (public.current_user_clinic_id())::text
  );

-- 2. Constraint names are intentionally preserved.
-- Renaming legacy PK/FK constraints is cosmetic and can collide with indexes
-- already created by the patient compatibility migrations.

