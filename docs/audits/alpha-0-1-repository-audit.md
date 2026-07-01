# Auditoria Técnica — PilatesVision Alpha 0.1

## Objetivo

Avaliar o estado real do repositório `Roplentz/pilatesvision` antes de iniciar a Fase Alpha 0.1, identificando o que já está pronto, o que é documentação, o que é infraestrutura e o que ainda precisa virar código executável.

## Resumo executivo

O projeto possui uma base conceitual e arquitetural forte, com documentação consistente, schema Supabase, políticas RLS, storage, contratos de front-end e backend, além do GitHub Innovation Agent.

O ponto crítico é que o repositório ainda parece estar majoritariamente em fase de documentação e infraestrutura. Não foram identificados, nesta auditoria inicial, arquivos típicos de aplicação executável como `package.json`, `src/`, componentes React, FastAPI real ou implementação MediaPipe em Python.

## Classificação geral

| Área | Status | Avaliação |
|---|---|---|
| Estratégia | Verde | Forte e bem direcionada |
| Documentação | Verde | Muito boa |
| Supabase schema | Verde | Base criada |
| Segurança RLS | Amarelo | Criada, mas precisa teste real |
| Storage | Amarelo | Criado, mas precisa validação no Supabase |
| Front-end | Vermelho | Contrato existe, implementação não identificada |
| Backend/FastAPI | Vermelho | Contrato existe, implementação não identificada |
| MediaPipe | Vermelho | Planejado, ainda não implementado no repo |
| Relatórios | Amarelo | Estrutura conceitual, sem motor implementado |
| Clinical Intelligence | Amarelo | Arquitetura definida, sem execução ainda |

## O que já está pronto

### 1. GitHub Innovation Agent

Arquivo:

```text
docs/agents/github-innovation-agent.md
```

Status: pronto como documento operacional.

Pontos fortes:

- Define funcionamento a cada 24h.
- Define critérios de busca.
- Define classificação dos achados.
- Conecta PilatesVision ao Core de Avaliação Inteligente do FisioHub.

### 2. Supabase Core Schema

Arquivo:

```text
supabase/migrations/2026070101_mvp_core_schema.sql
```

Status: schema pronto para teste.

Inclui:

- clinics
- professionals
- patients
- assessments
- assessment_media
- pose_landmarks
- biomechanical_metrics
- clinical_scores
- clinical_insights
- reports

Ponto forte: separa dados brutos, métricas, scores e insights, preparando o sistema para explicabilidade clínica.

### 3. RLS Policies

Arquivo:

```text
supabase/migrations/2026070102_mvp_rls_policies.sql
```

Status: pronto para validação.

Pontos fortes:

- RLS ativado.
- Segurança baseada em clínica.
- Função `user_has_clinic_access`.
- Acesso por owner e profissionais vinculados.

Risco: precisa ser testado em ambiente real para verificar onboarding, inserts e permissões cruzadas.

### 4. Storage Setup

Arquivo:

```text
supabase/migrations/2026070103_mvp_storage_setup.sql
```

Status: pronto para validação.

Buckets:

- assessment-media
- report-pdfs
- clinic-assets

Risco: validar `storage.foldername(name)` no ambiente Supabase real.

### 5. Contrato Front-end

Arquivo:

```text
docs/frontend/auth-dashboard-clinic-contract.md
```

Status: especificado, não implementado.

Define:

- rotas;
- AuthGuard;
- ClinicGuard;
- Supabase client;
- clinicService;
- dashboard MVP.

### 6. Contrato Backend MediaPipe

Arquivo:

```text
docs/backend/mediapipe-processing-contract.md
```

Status: especificado, não implementado.

Define:

- endpoint de processamento;
- payload;
- resposta;
- erros;
- estrutura FastAPI sugerida;
- dependências;
- métricas MVP.

## O que ainda não está pronto

### 1. Aplicação front-end executável

Não foi identificado nesta auditoria inicial:

- `package.json`;
- `src/`;
- componentes React;
- rotas reais;
- Supabase client implementado;
- telas de login, dashboard ou pacientes.

Prioridade: alta.

### 2. Backend/FastAPI executável

Não foi identificado:

- `backend/app/main.py`;
- endpoints reais;
- serviço MediaPipe;
- serviço Supabase;
- cálculo geométrico;
- testes de processamento.

Prioridade: alta.

### 3. Integração real com Supabase

Temos migrations, mas falta confirmar:

- execução das migrations;
- funcionamento das policies;
- criação de clínica por usuário real;
- upload em storage;
- leitura por usuário autorizado.

Prioridade: muito alta.

### 4. Motor de relatórios

Existe conceito, mas falta:

- template HTML/PDF;
- geração de PDF;
- registro na tabela reports;
- QR/hash;
- layout clínico.

Prioridade: média, depois de MediaPipe.

## Riscos principais

1. A arquitetura está madura, mas ainda não há produto executável suficiente.
2. RLS pode bloquear onboarding se não for testado com usuário real.
3. Storage policy pode exigir ajuste no Supabase real.
4. MediaPipe ainda está no nível de contrato técnico.
5. Se avançarmos para IA clínica antes do fluxo básico funcionar, criaremos complexidade prematura.

## Próxima decisão recomendada

A Fase Alpha 0.1 deve começar pela criação do mínimo executável:

```text
1. Criar aplicação front-end base
2. Conectar Supabase
3. Testar login
4. Criar clínica
5. Criar paciente
6. Subir imagem
7. Rodar MediaPipe local/backend
8. Exibir resultado simples
```

## Plano Alpha 0.1 recomendado

### Alpha 0.1.1 — Bootstrap técnico

- Criar estrutura de app React/Vite ou confirmar app Lovable ativo.
- Criar `package.json`.
- Criar `src/lib/supabaseClient.ts`.
- Criar `.env.example`.
- Criar rotas mínimas.

### Alpha 0.1.2 — Supabase real

- Rodar migrations.
- Testar RLS.
- Testar criação de clínica.
- Testar storage.

### Alpha 0.1.3 — Primeiro fluxo clínico

- Login.
- Clínica.
- Paciente.
- Nova avaliação.
- Upload de imagem.

### Alpha 0.1.4 — Primeiro processamento

- FastAPI.
- MediaPipe.
- Landmarks.
- Métricas simples.
- Tela de resultado.

## Conclusão

O repositório está pronto para entrar em engenharia real, mas ainda não deve ser tratado como produto funcional.

A melhor decisão agora é congelar a documentação estratégica e iniciar implementação incremental do primeiro fluxo executável.

Frase guia:

```text
Menos documento novo. Mais fluxo vivo.
```
