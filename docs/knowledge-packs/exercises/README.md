# PilatesVision Exercise Knowledge Pack v1.0

**Nome:** PilatesVision Exercise Knowledge Pack v1.0
**Fonte oficial:** [`docs/clinical_decision_support/exercise_catalog.csv`](../../clinical_decision_support/exercise_catalog.csv)

## Uso

Este pacote de conhecimento é utilizado pelo PilatesVision como **apoio à decisão clínica**
no repertório de exercícios de Pilates (Mat, Reformer, Cadillac, Chair, Barrel) e em
acessórios/movimentos clínicos correlatos.

O pacote alimenta:

- a biblioteca visual em `/exercicios`,
- o seletor buscável (`ExerciseCatalogPicker`) usado na avaliação dinâmica e nas
  avaliações por exercício,
- a taxonomia usada para métricas de visão, compensações comuns e red flags.

## Regra clínica

- **Não é diagnóstico.**
- **Não é prescrição automática.**
- O conteúdo é **indicador** e **sugestão de apoio à decisão**. A seleção,
  a progressão e a regressão do exercício devem ser confirmadas pelo profissional
  responsável pelo paciente.

A linguagem exposta ao usuário deve seguir o padrão prudente do produto:
"indicador", "sugere", "apoio à decisão", "alerta". Não usar
"diagnóstico automático", "laudo definitivo" ou "prescrição automática".

## Orientação de implementação

1. **Fase atual (MVP):** o pacote vive como **catálogo local no frontend**
   (`src/lib/exerciseCatalog.ts`). Isso mantém o fluxo simples, reduz
   dependência de backend e evita alterar o schema clínico.
2. **Fase futura:** só migrar para o Supabase quando houver necessidade
   real de curadoria colaborativa por clínica ou de versionamento por
   paciente. A migração deve ser proposta em plano separado, respeitando
   RLS, isolamento por `clinic_id` e a política de dados sensíveis.

## Arquivos deste pacote

- `README.md` — este documento.
- `pilatesvision-exercise-knowledge-pack-v1.md` — especificação semântica:
  finalidade, taxonomia, domínios de score padrão e regra de linguagem.

A fonte de verdade dos exercícios permanece em
`docs/clinical_decision_support/exercise_catalog.csv`. Qualquer inclusão
ou alteração de exercício deve ser feita primeiro no CSV e depois
refletida no catálogo do frontend.