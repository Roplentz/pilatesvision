-- Sprint Zero — teste SQL de isolamento multi-clínica.
-- Executar SOMENTE contra Supabase local descartável.
-- Uso: psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
--
-- Cria duas clínicas, dois usuários e dois pacientes fictícios dentro de uma
-- transação revertida ao final. Valida SELECT, UPDATE e DELETE cruzados.

BEGIN;

INSERT INTO auth.users (id, email, encrypted_password, aud, role, instance_id)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'a@test.local', 'x', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
  ('00000000-0000-0000-0000-0000000000b1', 'b@test.local', 'x', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.clinics (id, name, slug, owner_user_id, email)
VALUES
  ('00000000-0000-0000-0000-00000000ca01', 'Clinica A', 'clinica-a', '00000000-0000-0000-0000-0000000000a1', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000cb01', 'Clinica B', 'clinica-b', '00000000-0000-0000-0000-0000000000b1', 'b@test.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, clinic_id, role)
VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'User A', '00000000-0000-0000-0000-00000000ca01', 'owner'),
  ('00000000-0000-0000-0000-0000000000b1', 'User B', '00000000-0000-0000-0000-00000000cb01', 'owner')
ON CONFLICT (id) DO UPDATE SET clinic_id = EXCLUDED.clinic_id;

INSERT INTO public.patients (id, clinic_id, full_name)
VALUES
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-00000000ca01', 'Paciente A'),
  ('00000000-0000-0000-0000-00000000bb01', '00000000-0000-0000-0000-00000000cb01', 'Paciente B')
ON CONFLICT (id) DO NOTHING;

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.patients;
  IF n <> 1 THEN RAISE EXCEPTION 'RLS FAIL: user A sees % patient rows (expected 1)', n; END IF;

  SELECT count(*) INTO n FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000bb01';
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user A leaked patient B'; END IF;

  UPDATE public.patients SET full_name = 'INTRUSAO A' WHERE id = '00000000-0000-0000-0000-00000000bb01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user A updated patient B'; END IF;

  DELETE FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000bb01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user A deleted patient B'; END IF;
END $$;

SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.patients;
  IF n <> 1 THEN RAISE EXCEPTION 'RLS FAIL: user B sees % patient rows (expected 1)', n; END IF;

  SELECT count(*) INTO n FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000aa01';
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B leaked patient A'; END IF;

  UPDATE public.patients SET full_name = 'INTRUSAO B' WHERE id = '00000000-0000-0000-0000-00000000aa01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B updated patient A'; END IF;

  DELETE FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000aa01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B deleted patient A'; END IF;
END $$;

RESET role;
ROLLBACK;
