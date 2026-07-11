
CREATE TABLE IF NOT EXISTS public.patient_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  consent_lgpd boolean NOT NULL DEFAULT false,
  consent_image_use boolean NOT NULL DEFAULT false,
  consent_ai_support boolean NOT NULL DEFAULT false,
  consent_text text,
  accepted_at timestamptz,
  ip_address text,
  responsible_professional_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON public.patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_clinic ON public.patient_consents(clinic_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_consents TO authenticated;
GRANT ALL ON public.patient_consents TO service_role;

ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consents_select_own_clinic" ON public.patient_consents
  FOR SELECT TO authenticated
  USING (clinic_id = public.current_user_clinic_id());

CREATE POLICY "consents_insert_own_clinic" ON public.patient_consents
  FOR INSERT TO authenticated
  WITH CHECK (clinic_id = public.current_user_clinic_id());

CREATE POLICY "consents_update_own_clinic" ON public.patient_consents
  FOR UPDATE TO authenticated
  USING (clinic_id = public.current_user_clinic_id())
  WITH CHECK (clinic_id = public.current_user_clinic_id());

CREATE TRIGGER trg_patient_consents_updated_at
  BEFORE UPDATE ON public.patient_consents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
