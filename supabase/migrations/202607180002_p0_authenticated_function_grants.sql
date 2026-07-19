-- P0 function grants.
-- Revoking EXECUTE from PUBLIC also removes the implicit permission inherited
-- by authenticated users. RLS helper functions must be explicitly executable
-- by `authenticated`, while remaining unavailable to `anon`.

DO $$
BEGIN
  IF to_regprocedure('public.has_role(uuid,public.app_role)') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated';
  END IF;

  IF to_regprocedure('public.current_clinic_id()') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.current_clinic_id() TO authenticated';
  END IF;

  IF to_regprocedure('public.current_user_clinic_id()') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.current_user_clinic_id() TO authenticated';
  END IF;

  IF to_regprocedure('public.is_platform_admin()') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated';
  END IF;

  IF to_regprocedure('public.platform_overview()') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.platform_overview() TO authenticated';
  END IF;
END
$$;
