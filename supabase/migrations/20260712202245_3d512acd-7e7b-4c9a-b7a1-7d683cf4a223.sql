
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

-- 2. Renomear constraints legadas students_* -> patients_* (cosmético, não destrutivo).
DO $$
DECLARE
  r record;
  target_name text;
BEGIN
  FOR r IN
    SELECT conname, conrelid, conrelid::regclass::text AS tbl
    FROM pg_constraint
    WHERE conname LIKE 'students_%'
       OR conname LIKE 'assessments_student_id_%'
       OR conname LIKE 'exercise_results_student_id_%'
       OR conname LIKE 'movement_results_student_id_%'
       OR conname LIKE 'postural_results_student_id_%'
  LOOP
    target_name := replace(replace(r.conname, 'students_', 'patients_'), 'student_id', 'patient_id');
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = target_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE %s RENAME CONSTRAINT %I TO %I',
        r.tbl, r.conname, target_name
      );
    END IF;
  END LOOP;
END $$;
