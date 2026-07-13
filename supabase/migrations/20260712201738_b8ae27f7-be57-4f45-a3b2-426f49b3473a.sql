
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clinics','profiles','user_roles','patients','patient_consents',
    'assessments','postural_results','movement_results','exercise_results',
    'prescribed_exercises','reports','exercise_library','pose_captures',
    'platform_admins'
  ] LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'assessments','exercise_library','exercise_results','movement_results',
    'patient_consents','patients','pose_captures','postural_results',
    'profiles','reports'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at()', t
    );
  END LOOP;
END $$;

DO $policy$
BEGIN
  IF to_regclass('public.platform_admins') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "platform_admins_select_self" ON public.platform_admins';
    EXECUTE 'CREATE POLICY "platform_admins_select_self" ON public.platform_admins
      FOR SELECT TO authenticated USING (user_id = auth.uid())';
  END IF;
END
$policy$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_consents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postural_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movement_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescribed_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pose_captures TO authenticated;
GRANT SELECT ON public.exercise_library TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
DO $grant$
BEGIN
  IF to_regclass('public.platform_admins') IS NOT NULL THEN
    GRANT SELECT ON public.platform_admins TO authenticated;
  END IF;
END
$grant$;

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_assessments_clinic_id ON public.assessments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_assessments_patient_id ON public.assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_clinic_id ON public.reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON public.reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_postural_results_assessment_id ON public.postural_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_movement_results_assessment_id ON public.movement_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_exercise_results_assessment_id ON public.exercise_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_patient_id ON public.patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_profiles_clinic_id ON public.profiles(clinic_id);
