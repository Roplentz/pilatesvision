
# Auditoria de prontidão para mercado — PilatesVision

Diagnóstico apenas de leitura. Nada foi alterado. Achados marcados como [OK], [ATENÇÃO] ou [BLOQUEADOR].

## 1) Build / Qualidade

- [OK] `bun run typecheck` passa (tsc --noEmit sem erros).
- [OK] `bun run build` passa (Nitro/Cloudflare, artefatos gerados).
- [OK] Nenhum `TODO`/`FIXME`/`HACK`/`mock`/`hardcoded` encontrado em `src/routes`, `src/lib`, `src/hooks`, `src/components`.
- [OK] Nenhum `: any` / `as any` / `<any>` nesses diretórios.
- [ATENÇÃO] Rotas com `loader` sem `errorComponent`/`notFoundComponent`: só `__root.tsx` e `.lovable.oauth.consent.tsx` os definem. Rotas de listagem/detalhe não têm boundary própria — falhas de Supabase caem no boundary padrão (funciona, mas UX genérica).

## 2) Dados reais x Mock

- [OK] Nenhum dado mock/fixture nas stores. `patientsStore`, `assessmentsStore`, `reportsStore`, `exerciseLibraryStore`, `patientConsentsStore`, `clinicsStore` leem Supabase real.
- [OK] `exercise_library` populada; `platform_overview()` usa contagens reais.

## 3) Segurança / RLS

- [OK] Todas as 13 tabelas em `public` têm `rowsecurity = true`.
- [OK] Nenhuma policy `USING true` em tabela clínica. Todas as tabelas de dado de paciente (`assessments`, `patients`, `postural_results`, `movement_results`, `exercise_results`, `reports`, `patient_consents`) estão escopadas por `clinic_id = current_user_clinic_id()`; `prescribed_exercises` amarra via `assessments.clinic_id`. `profiles`/`user_roles` escopados por `auth.uid()`.
- [OK] `exercise_library` é `SELECT` global só para `is_active=true` (catálogo, sem PII) — correto.
- [OK] Bucket `clinical-media` é privado (`public = false`).
- [OK] `SUPABASE_SERVICE_ROLE_KEY` só em `src/integrations/supabase/client.server.ts` (server-only, lido de `process.env`). Nenhum uso no bundle client.
- [ATENÇÃO] `src/routes/api/analyze-image.ts` é endpoint público (sem `_authenticated`, sem verificação de bearer). Recebe imagem em base64 e chama Lovable AI Gateway com `LOVABLE_API_KEY`. Sem rate limit e sem checagem de sessão → qualquer um com a URL consome créditos e envia imagens arbitrárias. Deveria exigir auth do usuário logado.

## 4) LGPD / Consentimento

- [OK] `patient_consents` grava `clinic_id`, `accepted_at`, `consent_text`, `responsible_professional_id` (via `patientConsentsStore.saveConsent`).
- [OK] Policies escopadas por `clinic_id`.
- [OK] `ClinicalMediaUploader` bloqueia upload quando `consentImageUse` é falso (UI desabilitada + toast + CTA para registrar consentimento).
- [BLOQUEADOR] Gate de consentimento não é aplicado nas telas antigas `_authenticated.avaliacao-postural.tsx` e `_authenticated.avaliacao-dinamica.tsx` (e `_authenticated.exercicios.tsx`), que usam `ImageAnalyzer` — este componente envia imagem do paciente para `/api/analyze-image` (IA generativa) sem checar consentimento e sem estar amarrado a `patient_id`. Duas violações combinadas: (a) dado biométrico sensível sai sem consentimento LGPD; (b) contradiz a regra Core "Sem IA generativa para decisão clínica no MVP". Ver: `src/components/ImageAnalyzer.tsx` + `src/routes/api/analyze-image.ts`.
- [ATENÇÃO] O gate é enforced só na UI. Não há trigger no banco / RLS que exija `consent_image_use=true` antes de gravar `media_files` — profissional mal-intencionado ou bug pode inserir mídia via API. Enforce em backend é recomendado.

## 5) Fluxo completo

- [OK] Auth + onboarding + criação de clínica: `auth.tsx`, `_authenticated.onboarding.tsx`, `handle_new_user()` criam clínica + profile automaticamente.
- [OK] Pacientes: lista, detalhe, novo — funcionais com Supabase.
- [OK] Avaliação unificada em `_authenticated.avaliacoes.$id.tsx` cobre postural / dinâmica / exercício de Pilates com upload consentido, seletor de biblioteca, `support_level`, achados, salvamento em `postural_results`/`movement_results`/`exercise_results`.
- [OK] Relatório: geração a partir de `assessment` → `report_json`, tela premium em `_authenticated.relatorios.$id.tsx`, PDF via `reportPdf.ts` salvo em `clinical-media` com `pdf_storage_path`.
- [OK] Histórico evolutivo do paciente + comparação das 2 últimas avaliações (`_authenticated.alunos.$id.tsx`).
- [BLOQUEADOR] Rotas duplicadas/legadas ainda presentes e navegáveis: `_authenticated.avaliacao-postural.tsx` (40L, só `ImageAnalyzer`), `_authenticated.avaliacao-dinamica.tsx` (101L, `ExerciseCatalogPicker` + IA), `_authenticated.exercicios.tsx` (616L, com `ImageAnalyzer`). Todas contornam o fluxo oficial (assessment vinculada a paciente + consentimento + persistência real). Precisam ser removidas ou redirecionadas para o fluxo canônico, como já foi feito em `_authenticated.nova-avaliacao.tsx`.
- [ATENÇÃO] `auth.tsx` tem link "Esqueci minha senha" apontando para `href="#"` — botão sem ação. Nenhuma chamada `supabase.auth.resetPasswordForEmail` no código.

## 6) Lacunas para produção

- [BLOQUEADOR] Recuperação de senha inexistente (ver acima) — clínica real precisa disso no dia 1.
- [BLOQUEADOR] Política de Privacidade / Termos / DPO inexistentes no repositório — obrigatório LGPD para tratar dado sensível.
- [BLOQUEADOR] IA generativa habilitada nas telas legadas contradiz o guardrail clínico + LGPD. Ou remover as telas ou remover `ImageAnalyzer`/`/api/analyze-image`.
- [ATENÇÃO] `/api/analyze-image` sem autenticação nem rate limit (créditos + PII em risco).
- [ATENÇÃO] Consentimento não enforced no backend (só UI).
- [ATENÇÃO] Rotas sem `errorComponent`/`notFoundComponent` próprios — falhas Supabase mostram fallback genérico.
- [ATENÇÃO] Sem observabilidade estruturada (nenhum log centralizado, Sentry, PostHog etc.). Só há `error-capture.ts` / `lovable-error-reporting.ts` para o console/preview.
- [ATENÇÃO] Sem transactional email configurado além do padrão Supabase (não vi templates customizados nem domínio verificado); reset/confirm dependeriam do e-mail padrão.
- [ATENÇÃO] Limite de upload em `mediaStorage.ts` = 50 MB; `ImageAnalyzer` usa 8 MB. Sem checagem de duração de vídeo, sem verificação de tipo MIME server-side, sem varredura antivírus.
- [ATENÇÃO] Responsividade / estados de loading / empty: não verificado em runtime nesta auditoria — só leitura estática. Recomendo passada Playwright em `/dashboard`, `/alunos`, `/avaliacoes/$id`, `/relatorios/$id` em viewport 375×812 antes do go-live.
- [ATENÇÃO] Sem paginação nas listas (`usePatients`, `useAssessments`) — a partir de algumas centenas de linhas cai em performance/RLS scan.
- [ATENÇÃO] Sem retenção/expiração para PDFs e mídias em `clinical-media` — LGPD exige política de descarte.
- [ATENÇÃO] Sem fluxo de exclusão de conta/paciente com anonimização (direito ao esquecimento).

## Resumo executivo

Bloqueadores para "vendável a uma clínica" hoje:

1. Remover ou blindar as 3 rotas legadas (`avaliacao-postural`, `avaliacao-dinamica`, `exercicios`) e o `ImageAnalyzer` — violam LGPD e o guardrail "sem IA generativa clínica no MVP".
2. Implementar reset de senha (`supabase.auth.resetPasswordForEmail` + rota `/auth/reset`).
3. Publicar Política de Privacidade + Termos + contato do controlador.
4. Autenticar `/api/analyze-image` (ou removê-lo com item 1).

Depois disso, o fluxo canônico (auth → onboarding → paciente → consentimento → avaliação → relatório+PDF → histórico) está funcional ponta-a-ponta com RLS correta e sem mocks. O restante são melhorias importantes (observabilidade, boundaries, paginação, retenção) mas não impedem o primeiro cliente.
