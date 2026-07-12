-- Sprint Zero — teste SQL de isolamento multi-clínica.
-- Executar contra Supabase local (`supabase start`) — NÃO roda no CI padrão.
-- Uso: psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
--
-- Estratégia: cria duas clínicas + dois usuários (auth.users) + dois pacientes.
-- Alterna `request.jwt.claims` via SET LOCAL para simular sessões distintas
-- e assegura, com asserts, que cada usuário só enxerga a própria clínica.

BEGIN;

-- Fixtures.
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
  ('00000000-0000-0000-0000-00000000pa01', '00000000-0000-0000-0000-00000000ca01', 'Paciente A'),
  ('00000000-0000-0000-0000-00000000pb01', '00000000-0000-0000-0000-00000000cb01', 'Paciente B')
ON CONFLICT (id) DO NOTHING;

-- Sessão como usuário A.
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.patients;
  IF n <> 1 THEN RAISE EXCEPTION 'RLS FAIL: user A sees % patient rows (expected 1)', n; END IF;

  SELECT count(*) INTO n FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000pb01';
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user A leaked patient B'; END IF;
END $$;

-- Sessão como usuário B.
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.patients;
  IF n <> 1 THEN RAISE EXCEPTION 'RLS FAIL: user B sees % patient rows (expected 1)', n; END IF;

  SELECT count(*) INTO n FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000pa01';
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B leaked patient A'; END IF;
END $$;

RESET role;
ROLLBACK;