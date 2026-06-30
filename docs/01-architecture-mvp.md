# PilatesVision — Arquitetura MVP 1.0

## Objetivo do MVP

Criar uma versão clínica, simples e funcional para avaliação postural e análise de movimento no contexto do Pilates, com capacidade futura de expansão para outros módulos do FisioHub.

## Stack sugerida

### Frontend

- Streamlit para MVP rápido;
- React ou Next.js em fase posterior;
- design clínico, limpo e responsivo.

### Backend

- Python;
- FastAPI em fase posterior;
- arquitetura modular por serviços.

### Banco de dados

- Supabase PostgreSQL;
- Row Level Security;
- Storage para imagens e vídeos;
- autenticação com Supabase Auth.

### Visão computacional

- MediaPipe como primeira escolha para MVP;
- comparação futura com MoveNet, YOLO Pose e OpenPose.

### IA clínica

- LLM para síntese e relatório;
- regras clínicas controladas;
- validação profissional obrigatória.

## Arquitetura lógica

```text
app/
  modules/
    cadastro_anamnese/
    avaliacao_postural/
    avaliacao_dinamica/
    exercicios_pilates/
    relatorio_evolutivo/

core/
  vision_engine/
  pose_engine/
  movement_engine/
  clinical_engine/
  ai_engine/
  report_engine/

data/
  repositories/
  schemas/
  migrations/

docs/
  architecture/
  product/
  clinical/
  open_intelligence/
```

## Módulos do MVP

### 1. Cadastro e Anamnese

Funções:

- cadastro de paciente;
- dados clínicos essenciais;
- queixa principal;
- escala de dor;
- histórico;
- objetivos terapêuticos;
- contraindicações;
- consentimento para uso de imagem.

### 2. Avaliação Postural Estática

Funções:

- upload ou captura de foto;
- detecção de pontos anatômicos;
- avaliação frontal, lateral e posterior;
- cálculo de assimetrias;
- registro de observações clínicas.

### 3. Avaliação Dinâmica

Funções:

- upload de vídeo;
- análise de movimento;
- ângulos articulares;
- estabilidade;
- compensações;
- comparação entre sessões.

### 4. Exercícios de Pilates

Funções:

- biblioteca de exercícios;
- upload de vídeo por exercício;
- análise do movimento no exercício;
- alertas de compensação;
- orientação clínica.

### 5. Relatório Evolutivo

Funções:

- resumo da avaliação;
- gráficos simples;
- evolução temporal;
- recomendações;
- exportação em PDF.

## Banco de dados inicial

Tabelas sugeridas:

- users;
- professionals;
- clinics;
- patients;
- assessments;
- media_files;
- pose_landmarks;
- movement_metrics;
- pain_scores;
- clinical_findings;
- exercise_library;
- exercise_sessions;
- reports.

## Segurança

Requisitos mínimos:

- autenticação obrigatória;
- dados privados por clínica/profissional;
- Row Level Security no Supabase;
- consentimento para imagens;
- logs de acesso;
- separação entre dados clínicos e arquivos de mídia.

## Princípios clínicos

- O sistema não substitui avaliação profissional.
- Todo relatório deve ser validado por fisioterapeuta.
- A IA deve explicar incertezas.
- O sistema deve evitar diagnóstico médico automático.
- O foco é apoio à decisão, acompanhamento e comunicação visual.

## Critérios de sucesso do MVP

O MVP será considerado funcional quando permitir:

1. cadastrar paciente;
2. registrar anamnese;
3. enviar foto ou vídeo;
4. detectar pose;
5. calcular pelo menos cinco métricas biomecânicas;
6. gerar relatório simples;
7. salvar evolução;
8. manter dados protegidos.

## Próxima decisão técnica

Construir a Sprint 1 com foco em:

- estrutura Supabase;
- autenticação;
- cadastro;
- upload de mídia;
- base do Vision Engine.
