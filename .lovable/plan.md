# Diagnóstico do PilatesVision e Plano de Melhorias

## 1. Estado atual (verificado agora no HEAD)

- **Build / Typecheck:** ✅ passam (`tsc --noEmit` limpo).
- **Testes unitários:** ✅ 46/46 em 5 arquivos (journey isolation, RLS estático, poseMetrics, motionCoreShadow, fisiovision).
- **Lint:** ❌ falha em `format:check` / `eslint` (centenas de diffs de Prettier acumulados).
- **Rotas presentes:** auth (+ reset), landing pública, privacidade/termos, `_authenticated` (dashboard, onboarding, alunos, avaliações, relatórios, configurações, admin) e MCP/OAuth/sitemap.
- **Motor biomecânico:** legado (`poseMetrics`) oficial + `fisiohub-motion-core` em modo sombra atrás de flag; captura MediaPipe isolada com `<ClientOnly>` + `LocalErrorBoundary`.
- **Integração FisioVision:** presente, desligada por padrão via flag/secret.
- **Supabase:** 15 tabelas com RLS por `clinic_id`; storage `clinical-media` com policies por segmento de path; funções `SECURITY DEFINER` sem acesso anônimo.

**Veredito:** ATENÇÃO — sem bloqueadores P0 para uso interno, mas há um conjunto claro de P1s que precisam cair antes de piloto pago em múltiplas clínicas.

## 2. Achados por severidade

### P0 — impedem piloto pago
Nenhum novo identificado. (Regressões antigas de SSR/env já corrigidas.)

### P1 — corrigir antes do piloto em 3–10 clínicas
1. **Consentimento LGPD validado só no cliente.** Um chamador direto do PostgREST insere avaliações/mídias sem o consentimento. Falta trigger/policy no banco exigindo consentimento vigente do paciente antes de INSERT em `assessments`, `postural_results`, `movement_results`, `exercise_results`, `pose_captures`, `fisiovision_analyses`.
2. **Logout não limpa cache.** `signOut` não chama `queryClient.clear()` nem invalida rotas → dados de um usuário podem aparecer para o próximo em máquina compartilhada da clínica.
3. **Auth listeners duplicados.** `useAuth` mantém `onAuthStateChange` próprio em vez de consumir o listener único do `__root.tsx`, com risco de race em `TOKEN_REFRESHED`/`INITIAL_SESSION`.
4. **PDF sem hash/carimbo.** Relatório finalizado não grava hash SHA-256 + versão + `finalized_at` na tabela para verificação posterior de integridade.
5. **`fisiovision_analyses` com RLS ligada mas sem policies.** Hoje só acessível via service_role; qualquer tentativa futura de leitura pelo app quebra silenciosamente. Definir policies explícitas por `clinic_id` (mesmo que só SELECT autenticado) ou documentar como server-only.
6. **Lint quebrado.** `bun run ci` falha em `format:check`/`lint:check`, o que derruba o pipeline GitHub Actions e mascara regressões reais.

### P2 — pós-piloto / higiene
7. **Cobertura E2E fraca no CI.** `journey.e2e.ts` e `camera-mobile.e2e.ts` existem mas não rodam no workflow.
8. **Motor sombra sem coleta de métricas agregadas.** `fisiohub_motion_core_shadow` é gravado no JSON, mas não há painel/consulta agregando divergências vs. legado — dificulta decidir a promoção do novo motor.
9. **Onboarding sem tour guiado.** Fluxo depende do usuário adivinhar "criar aluno → criar avaliação → gerar relatório".
10. **Acessibilidade.** Faltam `aria-label`s em botões de ícone (uploader, PoseCapture, tabs) e foco visível consistente.
11. **Observabilidade.** Sem captura estruturada de erros do cliente (Sentry-like); hoje só há `console.error`. Dificulta suporte em piloto.
12. **Documentação de operação.** README cobre bootstrap, mas falta runbook curto de "como resetar senha de um profissional", "como revogar consentimento" e "como exportar dados de um paciente" (direito LGPD).

## 3. Roadmap sugerido

### Sprint A (1 semana) — Hardening para piloto
- Migration com **trigger de consentimento** em todas as tabelas clínicas dependentes.
- `queryClient.clear()` + `router.invalidate()` no signOut; consolidar `useAuth` em torno do listener do root.
- Consertar `lint`/`format` e reativar `bun run ci` no GitHub Actions.
- Policies explícitas em `fisiovision_analyses`.
- Persistir `report_hash`, `report_version`, `finalized_by` em `reports`.

### Sprint B (1 semana) — Confiança clínica
- Painel interno (rota admin) comparando repetições/válidas entre motor legado e sombra a partir de `movement_results.result.fisiohub_motion_core_shadow`.
- E2E do fluxo canônico no CI (headless chromium): login → aluno → avaliação → PDF.
- Endpoint de export LGPD por paciente (JSON + PDFs) restrito a admin da clínica.

### Sprint C (2 semanas) — UX e crescimento
- Tour guiado no primeiro login (dashboard vazio → CTA).
- Acessibilidade AA nos botões de ícone e formulários.
- Sentry (ou equivalente) com scrubbing de PII; alertas em erros de captura e upload.
- Runbooks LGPD e suporte em `docs/`.

## 4. Fora de escopo
Sem migrations, sem mudanças de código nesta etapa — este documento é diagnóstico + plano. A execução de cada Sprint entra como tarefa separada e cada mudança de banco/RLS será proposta com plano específico antes de rodar.
