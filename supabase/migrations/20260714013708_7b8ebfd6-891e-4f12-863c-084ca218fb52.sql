-- Lock down SECURITY DEFINER functions: remove PUBLIC (anon) execute access.
-- Functions introduced outside the canonical bootstrap are guarded so a clean
-- local database can apply the complete migration chain deterministically.

DO $$
BEGIN
  IF to_regprocedure('public.has_role(uuid,public.app_role)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon';
  END IF;

  IF to_regprocedure('public.current_clinic_id()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM PUBLIC, anon';
  END IF;

  IF to_regprocedure('public.current_user_clinic_id()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.current_user_clinic_id() FROM PUBLIC, anon';
  END IF;

  IF to_regprocedure('public.is_platform_admin()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon';
  END IF;

  IF to_regprocedure('public.platform_overview()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.platform_overview() FROM PUBLIC, anon';
  END IF;

  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regprocedure('public.tg_set_updated_at()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regprocedure('public.claim_fisiovision_analysis()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.claim_fisiovision_analysis() FROM PUBLIC, anon, authenticated';
  END IF;
END
$$;
