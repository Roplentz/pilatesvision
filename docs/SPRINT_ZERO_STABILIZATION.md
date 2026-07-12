# Sprint Zero — Estabilização

Matriz de entregas, comandos, evidências, limitações e critérios de aceite.

## Entregas

| # | Entrega | Artefato | Status |
|---|---------|----------|--------|
| A | Banco oficial reproduzível | `supabase/migrations/*_canonical_baseline` (última migration) + `docs/db/SCHEMA_AUDIT.md` | ✅ aditiva/idempotente, aplicada em produção |
| B | Segurança multi-clínica validada | `src/__tests__/rls-static.test.ts`, `supabase/tests/rls_isolation.sql`, rotas legadas removidas | ✅ estática no CI; SQL manual em Supabase local |
| C | CI verde | `.github/workflows/ci.yml` (Bun fixado, format:check, lint:check, typecheck, test:run, build) | ✅ pipeline determinística |
| D | Jornada com dois usuários / dois pacientes | `src/__tests__/journey-isolation.test.ts` (mock in-memory, roda no CI) + `e2e/journey.spec.ts` (Playwright, skip por padrão) | ⚠ Playwright autenticado só roda localmente contra Supabase local |

## Comandos

```bash
bun install --frozen-lockfile
bun run format:check      # prettier em modo verificação
bun run lint:check        # eslint sem --fix
bun run typecheck         # tsc --noEmit
bun run test:run          # vitest run (inclui rls-static + journey-isolation)
bun run build             # build de produção
bun run ci                # roda tudo em sequência
```

### Rodando o teste SQL de RLS (opcional, exige Supabase local)

```bash
supabase start
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
# Sucesso silencioso; qualquer violação de isolamento aborta a transação.
```

### Rodando E2E Playwright localmente

```bash
supabase start
# Semeie dois usuários fictícios + duas clínicas (ex.: via supabase/tests/seed.sql).
export RUN_E2E=1
export E2E_USER_A_EMAIL=... E2E_USER_A_PASSWORD=...
export E2E_USER_B_EMAIL=... E2E_USER_B_PASSWORD=...
bun add -d @playwright/test && bunx playwright install chromium
bun run dev &
bunx playwright test e2e/journey.spec.ts
```

## Rotas legadas removidas

- `_authenticated.avaliacao-postural.tsx` — redirecionava para `/avaliacoes/nova`.
- `_authenticated.avaliacao-dinamica.tsx` — idem.
- `_authenticated.exercicios.tsx` — idem.

Fluxo canônico único: `/alunos → /alunos/$id → /avaliacoes/nova → /avaliacoes/$id → /relatorios/$id`, sempre vinculado a paciente + consentimento.

## Endpoint público `/api/analyze-image`

**Auditado — inexistente.** `rg -n "analyze-image" src/` retorna zero. Não há caminho legado de IA generativa clínica exposto publicamente no MVP. Teste `rls-static.test.ts` garante que qualquer reintrodução falhe o CI.

## Limitações declaradas

1. **Playwright autenticado real** requer Supabase local + usuários semeados. Não roda no sandbox Lovable nem no CI padrão (segredos ausentes).
2. **Teste RLS real** roda em Postgres local; o CI usa apenas o teste estático de parsing das migrations.
3. **`bun install`** no CI executa scripts arbitrários (rebuild de nativos). Segredos de forks não estão expostos.
4. **Migration canônica é aditiva.** Divergências antigas (ex.: policy `Clinics: own clinic` como `TO public`) permanecem por segurança — corrigir exigiria DROP POLICY explícito, avaliar em sprint futuro.
5. **Motor biomecânico**: este sprint é apenas de estabilização; não faz validação clínica.

## Critérios de aceite

- `bun run ci` sai com código 0 no sandbox Lovable e no GitHub Actions.
- `supabase--linter` sem warnings novos introduzidos por esta migration (warnings pré-existentes de `SECURITY DEFINER` são intencionais — funções `has_role`, `current_clinic_id`, `is_platform_admin` precisam ser chamáveis por usuários autenticados dentro de policies).
- Nenhum dado de produção alterado, nenhum DROP destrutivo executado.
- Nenhuma rota legada permanece no repositório.