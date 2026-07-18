# P0 — Validação de lançamento

Este documento registra o portão técnico que deve permanecer verde antes do piloto externo do PilatesVision.

## Verificações automatizadas

O workflow `CI` executa em dois jobs independentes:

1. **Frontend quality**
   - instalação reproduzível pelo `bun.lock`;
   - formatação;
   - ESLint;
   - TypeScript;
   - testes Vitest;
   - build de produção.

2. **Supabase, RLS and clinical journey**
   - inicialização de um Supabase local descartável;
   - reconstrução completa pelas migrations;
   - teste SQL de isolamento entre clínicas;
   - instalação do Chromium;
   - jornada gravada de login, paciente, consentimento, avaliação, relatório e PDF;
   - teste da seleção de câmera em viewport móvel;
   - armazenamento de vídeo, screenshots, traces e relatório Playwright como artefato do CI.

## Validação física obrigatória

A emulação móvel confirma layout e seleção de câmera, mas não substitui o teste do hardware real. Antes de publicar, executar em pelo menos:

- um Android com Chrome;
- um iPhone com Safari.

Em cada aparelho, confirmar:

- permissão inicial e nova tentativa após negar a permissão;
- abertura da câmera traseira;
- alternância traseira/frontal;
- enquadramento vertical e horizontal;
- alinhamento entre vídeo, guia e esqueleto;
- captura, validação e salvamento dos landmarks;
- retorno seguro ao fluxo após desligar a câmera.

Registrar aparelho, sistema, navegador, resultado e evidência no PR ou na ata do piloto.
