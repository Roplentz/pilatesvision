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

INSERT INTO public.patients (id, clinic_id, name)
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

  UPDATE public.patients SET name = 'INTRUSAO A' WHERE id = '00000000-0000-0000-0000-00000000bb01';
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

  UPDATE public.patients SET name = 'INTRUSAO B' WHERE id = '00000000-0000-0000-0000-00000000aa01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B updated patient A'; END IF;

  DELETE FROM public.patients WHERE id = '00000000-0000-0000-0000-00000000aa01';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS FAIL: user B deleted patient A'; END IF;
END $$;

RESET role;

-- Full P0 coverage: seed one row per clinic in every clinical surface.
INSERT INTO public.patient_consents (id,clinic_id,patient_id) VALUES
('00000000-0000-0000-0000-00000000ac01','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01'),
('00000000-0000-0000-0000-00000000bc01','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01');
INSERT INTO public.assessments (id,clinic_id,patient_id,type) VALUES
('00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01','postural_static'),
('00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01','postural_static');
INSERT INTO public.postural_results (id,assessment_id,clinic_id,patient_id) VALUES
('00000000-0000-0000-0000-00000000a601','00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01'),
('00000000-0000-0000-0000-00000000b601','00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01');
INSERT INTO public.movement_results (id,assessment_id,clinic_id,patient_id) VALUES
('00000000-0000-0000-0000-00000000a701','00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01'),
('00000000-0000-0000-0000-00000000b701','00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01');
INSERT INTO public.exercise_results (id,assessment_id,clinic_id,patient_id,exercise_name) VALUES
('00000000-0000-0000-0000-00000000a801','00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01','A'),
('00000000-0000-0000-0000-00000000b801','00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01','B');
INSERT INTO public.prescribed_exercises (id,assessment_id,name) VALUES
('00000000-0000-0000-0000-00000000a901','00000000-0000-0000-0000-00000000a501','A'),
('00000000-0000-0000-0000-00000000b901','00000000-0000-0000-0000-00000000b501','B');
INSERT INTO public.reports (id,assessment_id,clinic_id,patient_id,title) VALUES
('00000000-0000-0000-0000-00000000aa91','00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01','A'),
('00000000-0000-0000-0000-00000000bb91','00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01','B');
INSERT INTO public.pose_captures (id,assessment_id,clinic_id,patient_id) VALUES
('00000000-0000-0000-0000-00000000aaa1','00000000-0000-0000-0000-00000000a501','00000000-0000-0000-0000-00000000ca01','00000000-0000-0000-0000-00000000aa01'),
('00000000-0000-0000-0000-00000000bbb1','00000000-0000-0000-0000-00000000b501','00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01');
INSERT INTO storage.objects (id,bucket_id,name) VALUES
('00000000-0000-0000-0000-00000000aaa2','clinical-media','00000000-0000-0000-0000-00000000ca01/a/private.jpg'),
('00000000-0000-0000-0000-00000000bbb2','clinical-media','00000000-0000-0000-0000-00000000cb01/b/private.jpg');

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

DO $
DECLARE t text; n int;
BEGIN
 FOREACH t IN ARRAY ARRAY['patients','patient_consents','assessments','postural_results','movement_results','exercise_results','prescribed_exercises','reports','pose_captures'] LOOP
  EXECUTE format('SELECT count(*) FROM public.%I',t) INTO n;
  IF n<>1 THEN RAISE EXCEPTION 'RLS FAIL: A sees % rows in %',n,t; END IF;
 END LOOP;
 SELECT count(*) INTO n FROM storage.objects WHERE bucket_id='clinical-media';
 IF n<>1 THEN RAISE EXCEPTION 'RLS FAIL: A sees % storage objects',n; END IF;
END $;

-- Cross-clinic INSERTs must be rejected.
DO $
BEGIN
 BEGIN
  INSERT INTO public.patient_consents (clinic_id,patient_id) VALUES
  ('00000000-0000-0000-0000-00000000cb01','00000000-0000-0000-0000-00000000bb01');
  RAISE EXCEPTION 'RLS FAIL: foreign consent insert succeeded';
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL; END;
 BEGIN
  INSERT INTO storage.objects (bucket_id,name) VALUES
  ('clinical-media','00000000-0000-0000-0000-00000000cb01/a/attack.jpg');
  RAISE EXCEPTION 'RLS FAIL: foreign storage insert succeeded';
 EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL; END;
END $;

-- Cross-clinic UPDATE/DELETE must affect zero rows in every surface.
DO $
DECLARE r record; n int;
BEGIN
 FOR r IN SELECT * FROM (VALUES
 ('patients','00000000-0000-0000-0000-00000000bb01'),
 ('patient_consents','00000000-0000-0000-0000-00000000bc01'),
 ('assessments','00000000-0000-0000-0000-00000000b501'),
 ('postural_results','00000000-0000-0000-0000-00000000b601'),
 ('movement_results','00000000-0000-0000-0000-00000000b701'),
 ('exercise_results','00000000-0000-0000-0000-00000000b801'),
 ('prescribed_exercises','00000000-0000-0000-0000-00000000b901'),
 ('reports','00000000-0000-0000-0000-00000000bb91'),
 ('pose_captures','00000000-0000-0000-0000-00000000bbb1')
 ) x(tab,id) LOOP
  EXECUTE format('UPDATE public.%I SET id=id WHERE id=$1',r.tab) USING r.id::uuid;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>0 THEN RAISE EXCEPTION 'RLS FAIL: A updated B row in %',r.tab; END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id=$1',r.tab) USING r.id::uuid;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>0 THEN RAISE EXCEPTION 'RLS FAIL: A deleted B row in %',r.tab; END IF;
 END LOOP;
 UPDATE storage.objects SET name=name WHERE id='00000000-0000-0000-0000-00000000bbb2';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'RLS FAIL: A updated B storage'; END IF;
 DELETE FROM storage.objects WHERE id='00000000-0000-0000-0000-00000000bbb2';
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'RLS FAIL: A deleted B storage'; END IF;
END $;

-- Mirror SELECT checks as user B to detect asymmetric policies.
SET LOCAL request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';
DO $
DECLARE t text; n int;
BEGIN
 FOREACH t IN ARRAY ARRAY['patients','patient_consents','assessments','postural_results','movement_results','exercise_results','prescribed_exercises','reports','pose_captures'] LOOP
  EXECUTE format('SELECT count(*) FROM public.%I',t) INTO n;
  IF n<>1 THEN RAISE EXCEPTION 'RLS FAIL: B sees % rows in %',n,t; END IF;
 END LOOP;
 SELECT count(*) INTO n FROM storage.objects WHERE bucket_id='clinical-media';
 IF n<>1 THEN RAISE EXCEPTION 'RLS FAIL: B sees % storage objects',n; END IF;
END $;

RESET role;
ROLLBACK;
