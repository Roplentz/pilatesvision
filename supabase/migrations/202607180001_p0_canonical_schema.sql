-- P0 schema reconciliation.
-- The remote project evolved from the legacy `students` table, while a clean
-- bootstrap also creates the canonical `patients` table. Keep both histories
-- compatible and make the canonical schema match the frontend contract.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS clinical_notes text,
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS contraindications text[],
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS main_complaint text,
  ADD COLUMN IF NOT EXISTS medical_history text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
DECLARE
  goals_type text;
BEGIN
  SELECT data_type
    INTO goals_type
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'patients'
     AND column_name = 'goals';

  IF goals_type = 'text' THEN
    ALTER TABLE public.patients
      ALTER COLUMN goals TYPE text[]
      USING CASE
        WHEN goals IS NULL OR btrim(goals) = '' THEN NULL
        ELSE ARRAY[goals]
      END;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'sex'
  ) THEN
    UPDATE public.patients
       SET gender = COALESCE(gender, sex)
     WHERE gender IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'clinical_history'
  ) THEN
    UPDATE public.patients
       SET medical_history = COALESCE(medical_history, clinical_history)
     WHERE medical_history IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'notes'
  ) THEN
    UPDATE public.patients
       SET clinical_notes = COALESCE(clinical_notes, notes)
     WHERE clinical_notes IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'is_active'
  ) THEN
    UPDATE public.patients
       SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END
     WHERE status IS NULL OR status = '';
  END IF;
END
$$;

UPDATE public.patients SET status = 'active' WHERE status IS NULL OR status = '';
ALTER TABLE public.patients ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.patients ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'patients_status_p0_check'
       AND conrelid = 'public.patients'::regclass
  ) THEN
    ALTER TABLE public.patients
      ADD CONSTRAINT patients_status_p0_check
      CHECK (status IN ('active', 'inactive', 'archived'));
  END IF;
END
$$;

-- Columns introduced under the legacy name are canonicalized after all legacy
-- migrations have run.
DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'postural_results',
    'movement_results',
    'exercise_results'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = target_table
         AND column_name = 'student_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = target_table
         AND column_name = 'patient_id'
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I RENAME COLUMN student_id TO patient_id',
        target_table
      );
    END IF;
  END LOOP;
END
$$;

-- A column rename does not retarget its foreign key. Rebuild every patient
-- relationship explicitly so clean and remote databases have identical
-- referential integrity.
ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_student_id_fkey,
  DROP CONSTRAINT IF EXISTS assessments_patient_id_fkey;
ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_student_id_fkey,
  DROP CONSTRAINT IF EXISTS reports_patient_id_fkey;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.postural_results
  DROP CONSTRAINT IF EXISTS postural_results_student_id_fkey,
  DROP CONSTRAINT IF EXISTS postural_results_patient_id_fkey;
ALTER TABLE public.postural_results
  ADD CONSTRAINT postural_results_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.movement_results
  DROP CONSTRAINT IF EXISTS movement_results_student_id_fkey,
  DROP CONSTRAINT IF EXISTS movement_results_patient_id_fkey;
ALTER TABLE public.movement_results
  ADD CONSTRAINT movement_results_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.exercise_results
  DROP CONSTRAINT IF EXISTS exercise_results_student_id_fkey,
  DROP CONSTRAINT IF EXISTS exercise_results_patient_id_fkey;
ALTER TABLE public.exercise_results
  ADD CONSTRAINT exercise_results_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- The product uses these four canonical assessment types. Preserve legacy
-- values so existing data can still be restored into a clean environment.
ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_type_check;
ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_type_check
  CHECK (
    type IN (
      'postural_static',
      'dynamic',
      'pilates_exercise',
      'follow_up',
      'postural',
      'exercise',
      'complete',
      'general'
    )
  );

-- The authenticated UI calls this RPC on every protected route. Keep the
-- canonical bootstrap equivalent to the remote project rather than returning
-- a PostgREST 404.
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS platform_admins_select_self ON public.platform_admins;
CREATE POLICY platform_admins_select_self ON public.platform_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- `service_role` is used by server-only integrations and E2E provisioning. It
-- bypasses RLS but still requires table privileges.
GRANT ALL PRIVILEGES ON TABLE public.clinics TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.profiles TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.user_roles TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.patients TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.patient_consents TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.assessments TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.postural_results TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.movement_results TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.exercise_results TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.prescribed_exercises TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.reports TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.pose_captures TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.platform_admins TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
