# PilatesVision Exercise Knowledge Pack v1.0 — Especificação

## 1. Finalidade

Padronizar o conhecimento de exercícios utilizado pelo PilatesVision para
**apoio à decisão clínica** em Pilates. O pacote descreve como cada
exercício deve ser interpretado pelo produto: qual equipamento usa, em
que família/método se insere, qual é o objetivo clínico, quais métricas
de visão são observáveis, quais compensações são esperadas e quais red
flags devem gerar alerta.

O pacote **não** substitui avaliação profissional. Ele organiza
indicadores, cues e critérios de qualidade para que o profissional
decida com mais rapidez e consistência.

## 2. Fonte oficial

`docs/clinical_decision_support/exercise_catalog.csv`

O CSV é a fonte de verdade. Toda alteração no catálogo (novo exercício,
ajuste de red flag, revisão de método) deve ser feita primeiro nele.
A camada frontend (`src/lib/exerciseCatalog.ts`) reflete o CSV.

## 3. Taxonomia

Cada exercício é descrito pelos seguintes eixos:

| Campo                     | Descrição                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `equipment` / `apparatus` | Equipamento físico usado (Mat, Reformer, Cadillac, Wunda/Stability Chair, Ladder Barrel, Magic Circle, Foam roller, Parede, etc.).    |
| `level`                   | Nível de execução: básico, intermediário, avançado.                                                                                   |
| `methodFamily`            | Família/método de origem (Mat clássico, Mat contemporâneo/clínico, Reformer, Cadillac, Chair, Barrel, Acessórios, Clínico funcional). |
| `primaryGoal`             | Objetivo clínico principal (ex.: ativação de centro, mobilidade segmentar, estabilidade lombo-pélvica, controle unilateral).          |
| `clinicalFocus`           | Foco clínico complementar (estruturas, populações, condições de referência).                                                          |
| `visionMetrics`           | Métricas observáveis via visão computacional/análise de imagem (ângulos, simetria, trajetórias, estabilidade).                        |
| `commonCompensations`     | Compensações comuns esperadas durante a execução — servem como **alertas**, nunca como diagnóstico.                                   |
| `redFlags`                | Condições clínicas em que o exercício não deve ser executado sem adaptação profissional.                                              |
| `regression`              | Variação mais simples/segura para reduzir demanda.                                                                                    |
| `progression`             | Variação mais avançada para aumentar demanda.                                                                                         |

## 4. Domínios de score padrão

O produto avalia execução em seis domínios ponderados. Estes pesos são o
padrão do pacote e podem ser sobrescritos por exercício quando houver
justificativa clínica.

| Domínio            | Peso |
| ------------------ | ---- |
| Alinhamento        | 30%  |
| Amplitude segura   | 20%  |
| Controle / fluidez | 20%  |
| Simetria           | 15%  |
| Tempo / cadência   | 10%  |
| Tolerância clínica | 5%   |

O score final é sempre apresentado como **indicador de apoio à decisão**,
nunca como nota clínica definitiva.

## 5. Regra de linguagem prudente

Toda superfície do produto que expõe conteúdo deste pacote deve usar
linguagem prudente.

**Permitido:**

- "indicador"
- "sugere"
- "apoio à decisão"
- "alerta"
- "estimativa"

**Proibido:**

- "diagnóstico automático"
- "laudo definitivo"
- "prescrição automática"
- qualquer termo que implique substituição da avaliação profissional

## 6. Escopo desta versão

- v1.0 cobre repertório clássico e contemporâneo/clínico de Mat, Reformer,
  Cadillac, Wunda/Stability Chair e Ladder Barrel, mais acessórios
  (Magic Circle, faixa elástica, bola suíça, foam roller) e movimentos
  clínico-funcionais correlatos.
- Não cobre protocolos específicos de patologia. Isso é responsabilidade
  do profissional e/ou de pacotes clínicos posteriores.
- Não define prescrição de séries, cargas ou frequência. O pacote se
  limita a descrever cada exercício e seus critérios de execução.
