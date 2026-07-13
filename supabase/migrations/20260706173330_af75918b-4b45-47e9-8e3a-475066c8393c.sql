
-- =========================================================
-- 1) FUNÇÃO current_user_clinic_id (lê profiles.id = auth.uid())
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_user_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.current_user_clinic_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- =========================================================
-- 2) PROFILES: adicionar role default 'owner'
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner';

-- =========================================================
-- 3) STUDENTS: novos campos
-- =========================================================
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS main_complaint text,
  ADD COLUMN IF NOT EXISTS clinical_notes text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_status_check') THEN
    ALTER TABLE public.students ADD CONSTRAINT students_status_check
      CHECK (status IN ('active','inactive','archived'));
  END IF;
END $$;

DROP TRIGGER IF EXISTS students_set_updated_at ON public.students;
CREATE TRIGGER students_set_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- 4) ASSESSMENTS: novos campos + FK professional_id -> auth.users
-- =========================================================
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS objective text,
  ADD COLUMN IF NOT EXISTS pain_score integer,
  ADD COLUMN IF NOT EXISTS clinical_notes text,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessments_type_check') THEN
    ALTER TABLE public.assessments ADD CONSTRAINT assessments_type_check
      CHECK (type IN ('postural','dynamic','exercise','complete','general'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessments_status_check2') THEN
    ALTER TABLE public.assessments ADD CONSTRAINT assessments_status_check2
      CHECK (status IN ('draft','in_progress','in_review','finalized','completed','archived'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'assessments_professional_id_fkey' AND conrelid = 'public.assessments'::regclass
  ) THEN
    ALTER TABLE public.assessments
      ADD CONSTRAINT assessments_professional_id_fkey
      FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================
-- 5) POSTURAL_RESULTS: alinhar
-- =========================================================
ALTER TABLE public.postural_results
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS view text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS professional_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'student_id'
  ) THEN
    EXECUTE 'UPDATE public.postural_results pr
      SET clinic_id = a.clinic_id, student_id = a.student_id
      FROM public.assessments a
      WHERE pr.assessment_id = a.id AND (pr.clinic_id IS NULL OR pr.student_id IS NULL)';
  END IF;
END $$;

ALTER TABLE public.postural_results ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE public.postural_results ALTER COLUMN findings SET DEFAULT '[]'::jsonb;
UPDATE public.postural_results SET findings = '[]'::jsonb WHERE findings IS NULL;

DROP TRIGGER IF EXISTS postural_results_set_updated_at ON public.postural_results;
CREATE TRIGGER postural_results_set_updated_at BEFORE UPDATE ON public.postural_results
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- 6) MOVEMENT_RESULTS: alinhar
-- =========================================================
ALTER TABLE public.movement_results
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS movement_name text,
  ADD COLUMN IF NOT EXISTS compensations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS professional_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'student_id'
  ) THEN
    EXECUTE 'UPDATE public.movement_results mr
      SET clinic_id = a.clinic_id, student_id = a.student_id
      FROM public.assessments a
      WHERE mr.assessment_id = a.id AND (mr.clinic_id IS NULL OR mr.student_id IS NULL)';
  END IF;
END $$;

ALTER TABLE public.movement_results ALTER COLUMN clinic_id SET NOT NULL;

DROP TRIGGER IF EXISTS movement_results_set_updated_at ON public.movement_results;
CREATE TRIGGER movement_results_set_updated_at BEFORE UPDATE ON public.movement_results
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- 7) EXERCISE_RESULTS: nova tabela
-- =========================================================
CREATE TABLE IF NOT EXISTS public.exercise_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exercise_name text NOT NULL,
  apparatus text,
  execution_notes text,
  compensations jsonb NOT NULL DEFAULT '[]'::jsonb,
  control_level text,
  recommendation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.exercise_results TO authenticated;
GRANT ALL ON public.exercise_results TO service_role;

ALTER TABLE public.exercise_results ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_exercise_results_clinic ON public.exercise_results(clinic_id);
CREATE INDEX IF NOT EXISTS idx_exercise_results_assessment ON public.exercise_results(assessment_id);

DROP TRIGGER IF EXISTS exercise_results_set_updated_at ON public.exercise_results;
CREATE TRIGGER exercise_results_set_updated_at BEFORE UPDATE ON public.exercise_results
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- 8) REPORTS: expandir
-- =========================================================
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS plain_text text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.reports SET content = '{}'::jsonb WHERE content IS NULL;
UPDATE public.reports SET title = 'Relatório' WHERE title IS NULL;
ALTER TABLE public.reports ALTER COLUMN content SET NOT NULL;
ALTER TABLE public.reports ALTER COLUMN content SET DEFAULT '{}'::jsonb;
ALTER TABLE public.reports ALTER COLUMN title SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_status_check') THEN
    ALTER TABLE public.reports ADD CONSTRAINT reports_status_check
      CHECK (status IN ('draft','finalized','archived'));
  END IF;
END $$;

DROP TRIGGER IF EXISTS reports_set_updated_at ON public.reports;
CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- 9) RLS: recriar policies SELECT/INSERT/UPDATE (SEM DELETE)
--    para todas as tabelas clínicas, usando current_user_clinic_id()
-- =========================================================

-- STUDENTS
DROP POLICY IF EXISTS "Students: clinic scope" ON public.students;
DROP POLICY IF EXISTS "Students: select" ON public.students;
DROP POLICY IF EXISTS "Students: insert" ON public.students;
DROP POLICY IF EXISTS "Students: update" ON public.students;
CREATE POLICY "Students: select" ON public.students FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Students: insert" ON public.students FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Students: update" ON public.students FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- ASSESSMENTS
DROP POLICY IF EXISTS "Assessments: clinic scope" ON public.assessments;
DROP POLICY IF EXISTS "Assessments: select" ON public.assessments;
DROP POLICY IF EXISTS "Assessments: insert" ON public.assessments;
DROP POLICY IF EXISTS "Assessments: update" ON public.assessments;
CREATE POLICY "Assessments: select" ON public.assessments FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Assessments: insert" ON public.assessments FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Assessments: update" ON public.assessments FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- POSTURAL_RESULTS
DROP POLICY IF EXISTS "Postural: via assessment clinic" ON public.postural_results;
DROP POLICY IF EXISTS "Postural: select" ON public.postural_results;
DROP POLICY IF EXISTS "Postural: insert" ON public.postural_results;
DROP POLICY IF EXISTS "Postural: update" ON public.postural_results;
CREATE POLICY "Postural: select" ON public.postural_results FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Postural: insert" ON public.postural_results FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Postural: update" ON public.postural_results FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- MOVEMENT_RESULTS
DROP POLICY IF EXISTS "Movement: via assessment clinic" ON public.movement_results;
DROP POLICY IF EXISTS "Movement: select" ON public.movement_results;
DROP POLICY IF EXISTS "Movement: insert" ON public.movement_results;
DROP POLICY IF EXISTS "Movement: update" ON public.movement_results;
CREATE POLICY "Movement: select" ON public.movement_results FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Movement: insert" ON public.movement_results FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Movement: update" ON public.movement_results FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- EXERCISE_RESULTS
DROP POLICY IF EXISTS "ExerciseResults: select" ON public.exercise_results;
DROP POLICY IF EXISTS "ExerciseResults: insert" ON public.exercise_results;
DROP POLICY IF EXISTS "ExerciseResults: update" ON public.exercise_results;
CREATE POLICY "ExerciseResults: select" ON public.exercise_results FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "ExerciseResults: insert" ON public.exercise_results FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "ExerciseResults: update" ON public.exercise_results FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- REPORTS
DROP POLICY IF EXISTS "Reports: clinic scope" ON public.reports;
DROP POLICY IF EXISTS "Reports: select" ON public.reports;
DROP POLICY IF EXISTS "Reports: insert" ON public.reports;
DROP POLICY IF EXISTS "Reports: update" ON public.reports;
CREATE POLICY "Reports: select" ON public.reports FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Reports: insert" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());
CREATE POLICY "Reports: update" ON public.reports FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

-- =========================================================
-- 10) ONBOARDING: gatilho on_auth_user_created cria clínica + perfil
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
  v_full_name text;
  v_slug text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- Cria clínica se ainda não existir para este usuário
  SELECT id INTO v_clinic_id FROM public.clinics WHERE owner_user_id = NEW.id LIMIT 1;
  IF v_clinic_id IS NULL THEN
    v_slug := regexp_replace(lower(coalesce(v_full_name, 'clinica')), '[^a-z0-9]+', '-', 'g') || '-' || substr(NEW.id::text, 1, 8);
    INSERT INTO public.clinics (name, slug, owner_user_id, email)
    VALUES (COALESCE(v_full_name, 'Minha Clínica'), v_slug, NEW.id, NEW.email)
    RETURNING id INTO v_clinic_id;
  END IF;

  -- Cria/atualiza profile vinculado à clínica
  INSERT INTO public.profiles (id, full_name, avatar_url, clinic_id, role)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_clinic_id,
    'owner'
  )
  ON CONFLICT (id) DO UPDATE
    SET clinic_id = COALESCE(public.profiles.clinic_id, EXCLUDED.clinic_id),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  -- Mantém role legada em user_roles (não parte do MVP mas preservado)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'instrutor')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 11) Endurecer tg_set_updated_at (search_path já ok, garantir)
-- =========================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
