-- Compatibility bridge for the legacy students -> patients transition.
-- Runs before 2026070101_mvp_core_schema.sql during a clean bootstrap.
-- Safe on the existing database: only renames when the legacy column exists
-- and the canonical column does not.

DO $$
BEGIN
  IF to_regclass('public.assessments') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'assessments'
         AND column_name = 'student_id'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'assessments'
         AND column_name = 'patient_id'
     )
  THEN
    ALTER TABLE public.assessments RENAME COLUMN student_id TO patient_id;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.reports') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reports'
         AND column_name = 'student_id'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'reports'
         AND column_name = 'patient_id'
     )
  THEN
    ALTER TABLE public.reports RENAME COLUMN student_id TO patient_id;
  END IF;
END $$;
