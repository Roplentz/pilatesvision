# Sprint Zero — Estabilização

Matriz de entregas, comandos, evidências, limitações e critérios de aceite.

## Entregas

| #   | Entrega                             | Evidência atual                                                                          | Status                                                           |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| A   | Banco oficial                       | Migrations aditivas aplicadas no banco atual; bootstrap documentado                      | ⚠️ produção estabilizada; reconstrução limpa ainda não executada |
| B   | Segurança multi-clínica             | Testes estáticos no CI; SQL com SELECT/UPDATE/DELETE cruzados pronto para Supabase local | ⚠️ teste SQL real ainda não executado                            |
| C   | CI                                  | Bun fixado, format:check, lint:check, typecheck, test:run e build                        | ✅ local; GitHub Actions deve ser confirmado no commit           |
| D   | Jornada com dois usuários/pacientes | Vitest em memória e spec Playwright opt-in                                               | ⚠️ simulada; Playwright autenticado ainda não executado          |

## Entrega 1 — evidências

Duas migrations aditivas foram aplicadas em produção em 2026-07-12:

1. RLS habilitada nas tabelas canônicas, trigger de novo usuário, triggers updated_at, grants e índices.
2. Policies do bucket clinical-media recriadas para authenticated, incluindo DELETE, com escopo pelo primeiro segmento do caminho igual ao clinic_id. Constraints legadas foram renomeadas para patients sem alterar dados.

Essas execuções comprovam compatibilidade com o banco atual. A reprodução completa em banco vazio só será considerada comprovada após `supabase db reset` em ambiente local descartável.

## Validações executadas

```bash
bun run test:run       # 38/38
bun run typecheck
bun run format:check
bun run lint:check
```

## Validações locais ainda necessárias

```bash
supabase start
supabase db reset
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql

export RUN_E2E=1
export E2E_USER_A_EMAIL=...
export E2E_USER_A_PASSWORD=...
export E2E_USER_B_EMAIL=...
export E2E_USER_B_PASSWORD=...
bunx playwright test e2e/journey.e2e.ts
```

O teste SQL utiliza somente UUIDs hexadecimais válidos, valida leitura e bloqueio de alteração/exclusão entre clínicas e executa dentro de transação revertida.

## Fluxo canônico

`/alunos → /alunos/$id → /avaliacoes/nova → /avaliacoes/$id → /relatorios/$id`

As rotas legadas de avaliação foram removidas. O endpoint público legado `/api/analyze-image` não existe e sua reintrodução é bloqueada pelo teste estático.

## Critérios de encerramento

- Todos os comandos de CI retornam código zero.
- GitHub Actions verde no commit final.
- `supabase db reset` conclui em banco local vazio.
- `rls_isolation.sql` conclui sem exceção.
- Playwright autenticado completa a jornada A/B.
- Nenhum dado fictício é inserido na produção.
