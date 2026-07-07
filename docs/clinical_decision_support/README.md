# PilatesVision | Suporte à decisão clínica para exercícios de Pilates

Este diretório organiza o material de referência do PilatesVision para apoiar seleção, análise e progressão de exercícios de Pilates.

O objetivo não é automatizar conduta clínica de forma cega. O objetivo é transformar o repertório de Pilates em uma base estruturada para que o sistema gere indicadores, alertas e sugestões que ajudem o fisioterapeuta ou instrutor qualificado a decidir melhor.

## Arquivos

| Arquivo | Função |
|---|---|
| `pilates_methods.md` | Taxonomia dos métodos, escolas, abordagens e equipamentos de Pilates. |
| `exercise_catalog.csv` | Catálogo estruturado de exercícios para uso em produto, banco de dados e motor de análise. |
| `decision_support_rules.md` | Regras clínicas, alertas, regressões, progressões e limites éticos do suporte à decisão. |
| `supabase_schema.sql` | Modelo inicial de tabelas para inserir métodos, exercícios, imagens e regras no Supabase. |
| `image_reference/pilates_exercise_reference_sheet.svg` | Prancha visual esquemática própria, sem cópia de fotos comerciais. |

## Como usar no produto

1. Importar `exercise_catalog.csv` para uma tabela `pilates_exercises` no Supabase.
2. Associar cada exercício a uma família de método, equipamento, nível e objetivos clínicos.
3. Usar os campos de métricas visuais para orientar o motor Python/FastAPI com MediaPipe/OpenCV.
4. Exibir os alertas como apoio, nunca como diagnóstico automático.
5. Permitir que o profissional aceite, edite ou rejeite qualquer sugestão.

## Regra-mãe

O PilatesVision não substitui avaliação profissional. Ele gera indicadores visuais, métricas, tendências e alertas para apoio à decisão. A decisão clínica final continua sendo humana.

## Versão

- Versão inicial: `v0.1`
- Data: 2026-07-06
- Escopo: catálogo inicial para MVP clínico do PilatesVision
