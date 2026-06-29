
-- ──────────────────────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────────────────────
CREATE TYPE public.clinic_plan AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE public.professional_role AS ENUM ('owner', 'admin', 'professional', 'assistant');
CREATE TYPE public.professional_specialty AS ENUM ('Pilates', 'Fisioterapia', 'Educação Física', 'Osteopatia', 'RPG');
CREATE TYPE public.student_gender AS ENUM ('F', 'M', 'outro');
CREATE TYPE public.assessment_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE public.assessment_stage AS ENUM ('ficha', 'postural', 'dinamica', 'exercicios', 'relatorio');
CREATE TYPE public.exercise_category AS ENUM ('Mat', 'Reformer', 'Funcional', 'Alongamento');
CREATE TYPE public.exercise_level AS ENUM ('Iniciante', 'Intermediário', 'Avançado');
CREATE TYPE public.exercise_goal AS ENUM ('Core', 'Mobilidade', 'Estabilidade', 'Força', 'Postura', 'Equilíbrio');
CREATE TYPE public.ideal_view AS ENUM ('Lateral', 'Frontal', 'Posterior', 'Superior');

-- ──────────────────────────────────────────────────────────────
-- Helper: clinic_id do usuário logado
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ──────────────────────────────────────────────────────────────
-- clinics
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  email text NOT NULL,
  phone text,
  address jsonb,
  plan public.clinic_plan NOT NULL DEFAULT 'starter',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinics TO authenticated;
GRANT ALL ON public.clinics TO service_role;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics: members can view own clinic"
  ON public.clinics FOR SELECT TO authenticated
  USING (id = public.current_clinic_id() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clinics: admins manage"
  ON public.clinics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ──────────────────────────────────────────────────────────────
-- professionals
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role public.professional_role NOT NULL DEFAULT 'professional',
  specialty public.professional_specialty NOT NULL DEFAULT 'Pilates',
  license text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals: clinic scope"
  ON public.professionals FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());

-- ──────────────────────────────────────────────────────────────
-- students
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  birth_date date NOT NULL,
  gender public.student_gender NOT NULL,
  height_cm numeric(5,2) NOT NULL,
  weight_kg numeric(5,2) NOT NULL,
  goals text[] NOT NULL DEFAULT '{}',
  medical_history text,
  contraindications text[] NOT NULL DEFAULT '{}',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students: clinic scope"
  ON public.students FOR ALL TO authenticated
  USING (clinic_id = public.current_clinic_id())
  WITH CHECK (clinic_id = public.current_clinic_id());

-- ──────────────────────────────────────────────────────────────
-- assessments
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  status public.assessment_status NOT NULL DEFAULT 'draft',
  current_stage public.assessment_stage NOT NULL DEFAULT 'ficha',
  pain_level smallint NOT NULL DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 10),
  main_complaint text,
  observations text,
  goals text[] NOT NULL DEFAULT '{}',
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

-- ──────────────────────────────────────────────────────────────
-- postural_results
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.postural_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  shots jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postural_results TO authenticated;
GRANT ALL ON public.postural_results TO service_role;
ALTER TABLE public.postural_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Postural: via assessment clinic"
  ON public.postural_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));

-- ──────────────────────────────────────────────────────────────
-- movement_results
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.movement_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  analyses jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_score smallint NOT NULL DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movement_results TO authenticated;
GRANT ALL ON public.movement_results TO service_role;
ALTER TABLE public.movement_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movement: via assessment clinic"
  ON public.movement_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));

-- ──────────────────────────────────────────────────────────────
-- exercise_definitions (biblioteca pública para autenticados)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.exercise_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category public.exercise_category NOT NULL,
  level public.exercise_level NOT NULL,
  goal public.exercise_goal NOT NULL,
  ideal_view public.ideal_view NOT NULL,
  description text NOT NULL,
  joints text[] NOT NULL DEFAULT '{}',
  quality_criteria text[] NOT NULL DEFAULT '{}',
  common_compensations text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercise_definitions TO authenticated;
GRANT ALL ON public.exercise_definitions TO service_role;
ALTER TABLE public.exercise_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises: read for authenticated"
  ON public.exercise_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Exercises: admins manage"
  ON public.exercise_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ──────────────────────────────────────────────────────────────
-- prescribed_exercises
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.prescribed_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercise_definitions(id) ON DELETE RESTRICT,
  sets smallint NOT NULL DEFAULT 3,
  reps smallint NOT NULL DEFAULT 10,
  tempo text,
  notes text,
  "order" smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescribed_exercises TO authenticated;
GRANT ALL ON public.prescribed_exercises TO service_role;
ALTER TABLE public.prescribed_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prescribed: via assessment clinic"
  ON public.prescribed_exercises FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));

-- ──────────────────────────────────────────────────────────────
-- reports
-- ──────────────────────────────────────────────────────────────
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  summary text NOT NULL,
  recommendations text[] NOT NULL DEFAULT '{}',
  next_review_date date,
  pdf_url text,
  generated_by uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports: via assessment clinic"
  ON public.reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.clinic_id = public.current_clinic_id()));

-- ──────────────────────────────────────────────────────────────
-- Índices
-- ──────────────────────────────────────────────────────────────
CREATE INDEX idx_professionals_clinic ON public.professionals(clinic_id);
CREATE INDEX idx_students_clinic ON public.students(clinic_id);
CREATE INDEX idx_assessments_clinic ON public.assessments(clinic_id);
CREATE INDEX idx_assessments_student ON public.assessments(student_id);
CREATE INDEX idx_postural_assessment ON public.postural_results(assessment_id);
CREATE INDEX idx_movement_assessment ON public.movement_results(assessment_id);
CREATE INDEX idx_prescribed_assessment ON public.prescribed_exercises(assessment_id);
CREATE INDEX idx_reports_assessment ON public.reports(assessment_id);

-- ──────────────────────────────────────────────────────────────
-- Triggers updated_at (reusa public.tg_set_updated_at já existente)
-- ──────────────────────────────────────────────────────────────
CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_professionals_updated BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_postural_updated BEFORE UPDATE ON public.postural_results FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_movement_updated BEFORE UPDATE ON public.movement_results FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_exercises_updated BEFORE UPDATE ON public.exercise_definitions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_prescribed_updated BEFORE UPDATE ON public.prescribed_exercises FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- profiles FK para clinics
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_clinic_id_fkey
  FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;
