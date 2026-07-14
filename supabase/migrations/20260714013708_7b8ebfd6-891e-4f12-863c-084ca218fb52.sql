
-- Lock down SECURITY DEFINER functions: remove PUBLIC (anon) execute access.
-- Keep authenticated where required by RLS policies or admin RPCs.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_clinic_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_clinic_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.platform_overview() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_fisiovision_analysis() FROM PUBLIC, anon, authenticated;
