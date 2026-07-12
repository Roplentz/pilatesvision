# Sprint Zero de Estabilização — Plano

Escopo grande e sensível (schema clínico em produção, RLS, CI, E2E). Proponho executar em **4 fases sequenciais**, cada uma com evidências antes da próxima. Isto reduz risco de quebrar dados clínicos existentes.

## Premissas críticas a confirmar

1. **Banco atual tem dados reais?** Se sim, a migration canônica precisa ser **puramente aditiva/idempotente** (CREATE TABLE IF NOT EXISTS, ALTER … ADD COLUMN IF NOT EXISTS, CREATE POLICY guardado com DO $$ … EXCEPTION). Sem DROP, sem TRUNCATE.
2. **Divergência students/patients**: o schema remoto tem `patients` (confirmado no contexto). `students` só aparece em nomes de rota/UI. Confirmo: canônico = `patients`, apenas documentar; sem rename de tabela.
3. **Endpoint `/api/analyze-image`**: proposta é **remover** (não apenas autenticar), pois usa IA generativa clínica legada — memória do projeto proíbe isso no MVP. Confirmar.
4. **Playwright autenticado real**: requer Supabase local (`supabase start`) que **não roda no sandbox Lovable nem no CI padrão**. Entrega será: (a) teste de jornada em nível de stores/services com mocks do Supabase client rodando no Vitest do CI, (b) spec Playwright + docs prontos para rodar localmente contra `supabase start`, marcados como `test.skip` no CI.
5. **Testes RLS SQL**: mesma limitação. Entrega: arquivo `.sql` com asserts + script `scripts/test-rls.sh` que roda contra Postgres local; no CI apenas **teste estático** que faz parse das migrations e verifica presença de `ENABLE ROW LEVEL SECURITY` e políticas por tabela clínica.

## Fase 1 — Auditoria e migration canônica (bloqueante)

- Ler todas as migrations existentes em `supabase/migrations/` e o schema remoto via `supabase--read_query` (information_schema).
- Comparar com `src/integrations/supabase/types.ts` e usos reais no frontend (`rg` em `src/`).
- Produzir **UMA** nova migration `NNNN_canonical_baseline.sql` **aditiva**, cobrindo o que falta: índices, triggers `updated_at`, `handle_new_user`, bucket `clinical-media` (já existe — só idempotente), políticas RLS ausentes em `storage.objects` com prefixo `clinic_id/…`.
- **Não** recriar tabelas já existentes com CREATE TABLE — usar guards.
- Rodar `supabase--linter` depois.

Entrega: `supabase/migrations/<ts>_canonical_baseline.sql` + `docs/db/SCHEMA_AUDIT.md` com diff auditado.

## Fase 2 — Segurança multi-clínica

- Teste **estático** Vitest (`src/__tests__/rls-static.test.ts`) que lê os arquivos de migration e assegura, para cada tabela clínica (`patients`, `patient_consents`, `assessments`, `postural_results`, `movement_results`, `exercise_results`, `prescribed_exercises`, `reports`, `pose_captures`): `ENABLE ROW LEVEL SECURITY` presente + pelo menos uma policy referenciando `clinic_id` ou `current_clinic_id()`.
- Teste **SQL** (`supabase/tests/rls_isolation.sql`) executável via `psql` contra Supabase local — cria 2 clínicas, 2 users, 2 patients, e valida com `SET ROLE authenticated; SET request.jwt.claims …` que A não lê B. Documentado em `docs/db/RLS_TEST.md`; não roda no CI.
- Remover rotas legadas `avaliacao-postural`, `avaliacao-dinamica`, `exercicios` (já são redirects — apagar arquivos e limpar routeTree via regeneração).
- Remover `/api/analyze-image` (arquivo + qualquer referência).

## Fase 3 — CI verde

- `.github/workflows/ci.yml`: pinar `bun-version: 1.1.x` (versão testada), adicionar `format:check`, `lint:check`, `typecheck`, `test:run`, `build`.
- `package.json` scripts: `format:check` (prettier --check), `format` (--write), `lint:check` (eslint sem --fix), `lint` (com --fix).
- Rodar cada comando local no sandbox e corrigir falhas.

## Fase 4 — Jornada E2E

- Vitest de jornada usando os stores existentes (`assessmentsStore`, `patientsStore`, `reportsStore`) com Supabase client mockado — dois "usuários" (2 sessões mock), 2 patients, fluxo completo até relatório finalizado, cross-check de isolamento.
- Spec Playwright `e2e/journey.spec.ts` pronto mas `test.describe.skip` por padrão; docs em `docs/SPRINT_ZERO_STABILIZATION.md` explicando como rodar contra `supabase start`.
- Atualizar `README.md` com bootstrap limpo.

## Riscos e limitações declarados

- Sem Supabase local no sandbox, **não posso executar** teste real de RLS nem Playwright autenticado. O CI validará apenas o que é validável estaticamente + jornada mockada.
- Auditoria do schema depende de `supabase--read_query` retornar `information_schema` — se falhar, uso `types.ts` como fonte da verdade.
- "CI verde" só posso comprovar rodando os comandos localmente aqui; o run real do GitHub Actions só valida após push.
- Não tocarei em `src/integrations/supabase/{client,client.server,auth-*,types}.ts` (auto-gen).

## Ordem de aprovação necessária

Cada migration passa por sua aprovação individual via `supabase--migration`. Antes de começar, confirme:

- (a) OK com migration puramente **aditiva** (sem corrigir divergências que exigiriam DROP)?
- (b) OK **remover** `/api/analyze-image` (não apenas autenticar)?
- (c) OK Playwright autenticado ficar como **spec + docs** (skip no CI) devido à ausência de Supabase local no sandbox?
- (d) Quer que eu execute as 4 fases em uma única sessão longa, ou fase a fase com checkpoint?
