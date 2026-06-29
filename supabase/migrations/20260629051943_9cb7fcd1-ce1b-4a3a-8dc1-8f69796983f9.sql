
-- Limpa versões anteriores
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.prescribed_exercises CASCADE;
DROP TABLE IF EXISTS public.movement_results CASCADE;
DROP TABLE IF EXISTS public.postural_results CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.professionals CASCADE;
DROP TABLE IF EXISTS public.exercise_definitions CASCADE;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_clinic_id_fkey;
DROP TABLE IF EXISTS public.clinics CASCADE;

DROP TYPE IF EXISTS public.clinic_plan;
DROP TYPE IF EXISTS public.professional_role;
DROP TYPE IF EXISTS public.professional_specialty;
DROP TYPE IF EXISTS public.student_gender;
DROP TYPE IF EXISTS public.assessment_status;
DROP TYPE IF EXISTS public.assessment_stage;
DROP TYPE IF EXISTS public.exercise_category;
DROP TYPE IF EXISTS public.exercise_level;
DROP TYPE IF EXISTS public.exercise_goal;
DROP TYPE IF EXISTS public.ideal_view;

-- Helper: clinic_id do usuário logado (a partir do profile)
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── clinics ───
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  email text,
  phone text,
  address jsonb,
  plan text NOT NULL DEFAULT 'starter',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinics: own clinic"
  ON public.clinics FOR ALL TO authenticated
  USING (id = public.current_clinic_id())
  WITH CHECK (id = public.current_clinic_id());

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_clinic_id_fkey
  FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;

-- ─── students ───
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  birth_date date,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  goals text[],
  medical_history text,
  contraindications text[],
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students: clinic scope"
  ON public.students FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE INDEX idx_students_clinic ON public.students(clinic_id);

-- ─── assessments ───
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  professional_id uuid,
  status text NOT NULL DEFAULT 'draft',
  current_stage text NOT NULL DEFAULT 'ficha',
  pain_level int,
  main_complaint text,
  observations text,
  goals text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assessments: clinic scope"
  ON public.assessments FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE INDEX idx_assessments_clinic ON public.assessments(clinic_id);
CREATE INDEX idx_assessments_student ON public.assessments(student_id);

CREATE TRIGGER trg_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ─── postural_results ───
CREATE TABLE public.postural_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  score int,
  findings jsonb,
  image_urls jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postural_results TO authenticated;
GRANT ALL ON public.postural_results TO service_role;
ALTER TABLE public.postural_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Postural: via assessment clinic"
  ON public.postural_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));
CREATE INDEX idx_postural_assessment ON public.postural_results(assessment_id);

-- ─── movement_results ───
CREATE TABLE public.movement_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  controle int,
  estabilidade int,
  simetria int,
  amplitude int,
  movements_evaluated text[],
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movement_results TO authenticated;
GRANT ALL ON public.movement_results TO service_role;
ALTER TABLE public.movement_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movement: via assessment clinic"
  ON public.movement_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));
CREATE INDEX idx_movement_assessment ON public.movement_results(assessment_id);

-- ─── prescribed_exercises ───
CREATE TABLE public.prescribed_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  name text,
  focus text,
  series text,
  level text,
  order_index int
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescribed_exercises TO authenticated;
GRANT ALL ON public.prescribed_exercises TO service_role;
ALTER TABLE public.prescribed_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prescribed: via assessment clinic"
  ON public.prescribed_exercises FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));
CREATE INDEX idx_prescribed_assessment ON public.prescribed_exercises(assessment_id);

-- ─── reports ───
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  content jsonb,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports: clinic scope"
  ON public.reports FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());
CREATE INDEX idx_reports_clinic ON public.reports(clinic_id);
CREATE INDEX idx_reports_assessment ON public.reports(assessment_id);
