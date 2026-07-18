# PilatesVision — Definição de Lançamento do MVP v1.0

> **Data:** 2026-07-13 · **Decisão de produto (Rodrigo):** lançar o mais breve possível
> um MVP **crível e funcional**. Estratégia: **congelar escopo, estabilizar, lançar.**
> O que falta é acabamento e QA — não feature nova.

---

## 1. Escopo travado

### DENTRO do MVP v1.0

- **Fluxo clínico central (já existe):** login → consentimento → avaliação
  **postural + dinâmica** → relatório → **PDF** (rascunho e finalizado).
- **Motor Biomecânico de agachamento (LOCAL), como "beta / estimativa"**, claramente
  rotulado, **somente se** passar no QA e **sem poder quebrar o app** (isolado por
  error boundary próprio; câmera/MediaPipe só no cliente).

### FORA do MVP v1.0 (adiado para v1.1+)

- **Análise de vídeo em NUVEM / FisioVision** → feature flag **desligada**. Entra na
  v1.1 após DPA + consentimento LGPD específico + retenção (ver
  `docs/ARQUITETURA_MOTOR_HIBRIDO.md`).
- Validação QEVD, novos exercícios do motor, extração de `biomech-core`.

---

## 2. Portão de lançamento (Definition of Done)

Nada disso é feature — é o que torna o produto crível. Ordem = caminho crítico.

**P0 — Estabilidade (bloqueia tudo)**

- [ ] Tela de erro raiz eliminada: MediaPipe/`getUserMedia` só no cliente (import
      dinâmico, client-only, sem acesso a `window`/`navigator` no SSR).
- [ ] Error boundary raiz resiliente a 500 transitório (retry/fallback CSR) — um blip
      de backend não pode virar "app quebrado".
- [ ] Motor de agachamento isolado: falha nele **não** derruba a página.

**P0 — QA ponta a ponta (o gate real)**

- [ ] Um passe limpo, gravado: login → consentimento → avaliação postural → avaliação
      dinâmica → captura agachamento (beta) → relatório → PDF rascunho → PDF finalizado.
- [ ] Botão "Exportar PDF" só aparece após "Finalizado"; PDF correto nos dois estados.
- [ ] Sem `NaN`/`Infinity` no resumo biomecânico; bloqueio com motivo quando qualidade
      insuficiente + opção de recaptura.

**P1 — Segurança / dados (credibilidade "meus dados estão seguros")**

- [ ] Leaked Password Protection ativado (Auth).
- [ ] Políticas RLS duplicadas consolidadas (`clinics`, `profiles`).
- [ ] RLS multi-tenant confirmada (usuário só vê dados da própria clínica).
- [ ] Vídeo nunca sai do dispositivo no caminho local (verificado).

**P1 — Higiene**

- [ ] Remover `backup_pre_reconciliacao_2026-07-06.json` (PII de teste) e
      `pilatesvision-app--main.zip` do disco.
- [ ] Confirmar conector GitHub e sincronização.

---

## 3. Critérios de aceite do "agachamento beta"

Para o beta poder aparecer no MVP (senão, esconder e lançar sem ele):

- [ ] Rótulo visível "Beta — estimativa 2D, apoio à decisão, confirmar profissional".
- [ ] Linguagem prudente: "deslocamento frontal aparente do joelho", nunca "valgo"/diagnóstico.
- [ ] Testes determinísticos do núcleo (`poseMetrics.ts`): 0/1/3 repetições, ruído,
      baixa visibilidade, saída sem NaN — todos passando.
- [ ] Falha do motor não afeta o restante da avaliação.

---

## 4. Sequência até o piloto

1. Estabilizar (P0 estabilidade).
2. QA ponta a ponta gravado (P0 QA).
3. Segurança + higiene (P1).
4. **Piloto Sprint 5** no fluxo atual: 3 clínicas · 20 pacientes · 30 avaliações ·
   20 relatórios · 10 PDFs · relatório < 10 min · ≥70% preferência · ≥1 piloto pago.
5. Ler o resultado do piloto **antes** de decidir a v1.1 (vídeo em nuvem, novos exercícios).

---

## 5. Princípios de gerência (para não recair)

- **Congelamento de escopo até o piloto.** Nenhuma feature nova entra — só correção de bug
  do que está no escopo acima.
- **O gate de lançamento é qualidade, não quantidade.** Zero tela quebrada + 1 passe limpo
  ponta a ponta > qualquer recurso a mais.
- **A nuvem espera o jurídico, não o contrário.** O piloto não pode ficar refém do DPA.
