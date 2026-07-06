# PilatesVision — Open Intelligence Scanner

## Objetivo

Criar um processo sistemático para aprender com projetos públicos do GitHub e transformar conhecimento open source em vantagem estratégica para o PilatesVision.

## Princípio

O GitHub não será usado apenas como lugar para guardar código.

Ele será usado como fonte de inteligência tecnológica.

## Missão do scanner

Encontrar, analisar, classificar e recomendar projetos open source úteis para o PilatesVision.

## Áreas de busca

### Visão computacional

- MediaPipe;
- MoveNet;
- YOLO Pose;
- OpenPose;
- pose estimation;
- human pose detection;
- biomechanical analysis;
- movement analysis.

### Fisioterapia e saúde

- physical therapy;
- physiotherapy;
- rehabilitation;
- clinical dashboard;
- posture assessment;
- gait analysis;
- range of motion.

### Infraestrutura

- Supabase;
- Streamlit;
- FastAPI;
- PostgreSQL;
- authentication;
- medical records;
- PDF reports.

### IA e agentes

- RAG;
- LangGraph;
- AI agents;
- clinical decision support;
- report generation.

## Critérios de avaliação

Cada repositório deve receber notas de 0 a 5 nos seguintes critérios:

| Critério                 | Descrição                                         |
| ------------------------ | ------------------------------------------------- |
| Relevância               | Resolve problema importante para o PilatesVision? |
| Maturidade               | Está funcional, documentado e mantido?            |
| Comunidade               | Possui estrelas, forks, issues e atividade?       |
| Licença                  | Permite uso e adaptação segura?                   |
| Qualidade técnica        | Código organizado, modular e testável?            |
| Facilidade de integração | Consegue ser integrado com pouco esforço?         |
| Valor clínico            | Tem aplicação real para fisioterapia?             |
| Valor comercial          | Ajuda a criar diferencial competitivo?            |

## Classificação final

### A — Integrar

Projeto maduro, útil e compatível.

### B — Adaptar

Projeto útil, mas exige modificações.

### C — Estudar

Projeto interessante para aprendizado, mas não pronto.

### D — Descartar

Baixa qualidade, licença problemática ou pouca relevância.

## Registro padrão

Cada projeto avaliado deve gerar um registro:

```markdown
# Nome do Projeto

## Link

## Problema que resolve

## Stack

## Licença

## Pontos fortes

## Pontos fracos

## O que podemos reutilizar

## Riscos

## Onde entra no PilatesVision

## Nota final

## Recomendação
```

## Primeiros alvos de busca

1. MediaPipe pose examples;
2. Streamlit MediaPipe posture apps;
3. Python posture assessment;
4. Range of motion estimation Python;
5. Gait analysis OpenCV;
6. Supabase Streamlit auth;
7. Clinical PDF report generator;
8. Exercise recognition with pose estimation.

## Saída esperada

O scanner deve produzir:

- lista de repositórios promissores;
- resumo executivo;
- matriz de decisão;
- recomendação de integração;
- backlog técnico.

## Frequência

No MVP: revisão manual semanal.

Fase posterior: automação diária ou semanal usando GitHub API.

## Decisão estratégica

Todo novo módulo do PilatesVision deve passar pelo scanner antes de ser desenvolvido.

A regra é simples:

Aprender primeiro. Construir depois.
