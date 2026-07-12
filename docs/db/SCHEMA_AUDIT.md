# Auditoria de Schema — Sprint Zero

Data: 2026-07-12.

## Tabelas presentes no schema `public` (remoto)

`assessments`, `clinics`, `exercise_library`, `exercise_results`, `movement_results`, `patient_consents`, `patients`, `platform_admins`, `pose_captures`, `postural_results`, `prescribed_exercises`, `profiles`, `reports`, `user_roles`.

Todas com RLS habilitada após esta migration.

## Divergência students/patients

**Canônico: `patients`.** O termo "aluno" aparece apenas em rotas e labels de UI (`_authenticated.alunos.*`) por decisão de produto (linguagem de Pilates). A tabela sempre foi `patients` — nenhum rename necessário.

## O que a migration canônica adiciona

1. `ENABLE ROW LEVEL SECURITY` idempotente em 14 tabelas (garantia defensiva).
2. Trigger `on_auth_user_created` em `auth.users` → executa `public.handle_new_user()` (cria clinic + profile no signup).
3. Trigger `set_updated_at` em 10 tabelas com coluna `updated_at` (nenhuma tinha antes).
4. Policy `platform_admins_select_self` — antes a tabela tinha 0 policies com RLS on (efetivamente inacessível a authenticated).
5. GRANTs defensivos para role `authenticated` em todas as tabelas clínicas.
6. Índices em colunas de foreign key mais consultadas (`clinic_id`, `patient_id`, `assessment_id`).

## O que a migration NÃO faz (intencional)

- Não recria tabelas — schema real já corresponde a `types.ts`.
- Não remove policies pré-existentes com `roles = public` (ex.: `Clinics: own clinic`). Análise mostra que o predicado ainda escopa por `auth.uid()`; corrigir para `TO authenticated` fica para sprint de hardening.
- Não cria bucket `clinical-media` (bloqueio da plataforma para SQL de bucket) — bucket já existe e é privado (confirmado no contexto).
- Não altera `handle_new_user()`, `has_role()`, `current_clinic_id()`, `is_platform_admin()`, `platform_overview()`, `tg_set_updated_at()` — estão corretos.

## Warnings do linter Supabase pós-migration

9 warnings tipo `0028/0029 SECURITY DEFINER function executable`. Todos são **falsos positivos aceitáveis no MVP**:

- `has_role`, `current_clinic_id`, `current_user_clinic_id`, `is_platform_admin`: precisam ser executáveis por `authenticated` porque são usados dentro de expressões de RLS policies. Trocar para `SECURITY INVOKER` quebraria as policies.
- `handle_new_user`, `platform_overview`, `tg_set_updated_at`: SECURITY DEFINER intencional (o primeiro escreve em profiles no signup; o segundo faz sanity-check via `is_platform_admin`; o terceiro apenas atualiza timestamp).

Nenhum warning novo introduzido por esta migration.

## Bootstrap limpo (banco vazio)

A sequência `supabase/migrations/` roda em ordem cronológica e produz um schema equivalente ao remoto atual. `database/schema.sql` permanece apenas como documentação histórica — **não é fonte da verdade** e não deve ser executado.
