-- P0 schema reconciliation.
-- The remote project evolved from the legacy `students` table, while a clean
-- bootstrap also creates the canonical `patients` table. Keep both histories
-- compatible and make the canonical table match the frontend contract.

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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
