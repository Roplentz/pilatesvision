CREATE TABLE public.pose_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  exercise_key TEXT,
  exercise_label TEXT,
  orientation TEXT NOT NULL DEFAULT 'frontal' CHECK (orientation IN ('frontal','lateral','posterior')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  fps NUMERIC(6,2) NOT NULL DEFAULT 0,
  frame_count INTEGER NOT NULL DEFAULT 0,
  engine TEXT NOT NULL DEFAULT 'mediapipe-pose-landmarker',
  engine_version TEXT NOT NULL DEFAULT 'tasks-vision-0.10.35',
  quality JSONB NOT NULL DEFAULT '{}'::jsonb,
  landmarks JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pose_captures TO authenticated;
GRANT ALL ON public.pose_captures TO service_role;

ALTER TABLE public.pose_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pose_captures_select_by_clinic"
  ON public.pose_captures FOR SELECT
  TO authenticated
  USING (clinic_id = public.current_user_clinic_id());

CREATE POLICY "pose_captures_insert_by_clinic"
  ON public.pose_captures FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());

CREATE POLICY "pose_captures_update_by_clinic"
  ON public.pose_captures FOR UPDATE
  TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

CREATE POLICY "pose_captures_delete_by_clinic"
  ON public.pose_captures FOR DELETE
  TO authenticated
  USING (clinic_id = public.current_user_clinic_id());

CREATE INDEX pose_captures_assessment_idx ON public.pose_captures(assessment_id);
CREATE INDEX pose_captures_clinic_idx ON public.pose_captures(clinic_id);

CREATE TRIGGER pose_captures_set_updated_at
  BEFORE UPDATE ON public.pose_captures
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();