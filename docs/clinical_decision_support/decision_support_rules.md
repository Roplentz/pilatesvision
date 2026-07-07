# Regras de suporte à decisão clínica | PilatesVision

Este documento define como o PilatesVision deve usar o catálogo de exercícios sem extrapolar seu papel. O sistema apoia, mas não decide sozinho.

## Princípios

1. **Segurança antes de performance.** Se houver sinal de risco, o sistema deve reduzir intensidade, sugerir regressão ou recomendar reavaliação.
2. **Dor é dado clínico, não ruído.** A resposta ao exercício deve modular progressão.
3. **Qualidade do movimento vale mais que amplitude.** Amplitude bonita com compensação feia é maquiagem biomecânica.
4. **A decisão final é humana.** Toda recomendação deve ser editável pelo profissional.
5. **Não diagnosticar.** O app descreve achados observáveis: assimetria, tendência de valgo, perda de controle, limitação de amplitude, compensação cervical etc.

## Classificação de suporte

| Nível | Nome | Conduta sugerida pelo app |
|---|---|---|
| 0 | Observação segura | Exercício executado sem alerta relevante. Manter ou progredir conforme objetivo. |
| 1 | Atenção técnica | Há compensação leve. Sugerir cue, redução de amplitude ou ajuste de posicionamento. |
| 2 | Regressão recomendada | Compensação moderada, dor leve/moderada ou perda de controle. Sugerir exercício regressivo. |
| 3 | Interromper e reavaliar | Dor importante, tontura, dispneia, instabilidade, piora neurológica ou risco de queda. |

## Variáveis clínicas mínimas antes de recomendar exercício

- objetivo principal do atendimento;
- nível do paciente/aluno;
- equipamento disponível;
- dor atual e dor durante o movimento;
- histórico relevante informado pelo profissional;
- restrições de ombro, coluna, quadril, joelho, equilíbrio ou pós-operatório;
- preferência e tolerância do paciente;
- resposta ao exercício anterior.

## Sinais de alerta gerais

O app deve exibir alerta de interrupção/reavaliação se houver:

- dor torácica, falta de ar desproporcional ou tontura;
- perda de força súbita, alteração sensitiva ou sintoma neurológico progressivo;
- dor irradiada progressiva durante o exercício;
- risco evidente de queda;
- dor maior que o limite definido pelo profissional;
- aumento importante de dor após repetição;
- pós-operatório sem liberação para carga/amplitude proposta;
- pressão arterial, sintomas ou condição sistêmica incompatível com exercício naquele momento.

## Regras por região/função

### Coluna lombar

| Achado visual ou clínico | Ação sugerida |
|---|---|
| Hiperlordose com perda de controle em abdominal | Elevar pernas, reduzir alavanca, apoiar cabeça ou regredir para respiração/ponte baixa. |
| Dor lombar durante extensão | Reduzir amplitude, priorizar extensão torácica, revisar ativação glútea e interromper se dor aumentar. |
| Assimetria pélvica em ponte | Reduzir altura, alinhar pés, usar feedback visual e considerar ponte bilateral antes de unilateral. |

### Ombro e cervical

| Achado visual ou clínico | Ação sugerida |
|---|---|
| Elevação de ombros em exercício de braços | Reduzir carga/mola, orientar escápulas, diminuir amplitude. |
| Dor cervical em flexão de tronco | Apoiar cabeça, reduzir repetições ou trocar por exercício com cabeça apoiada. |
| Escápula alada ou perda de controle em prancha | Regredir para apoio de joelhos, parede ou exercícios escapulares. |

### Quadril, joelho e pé

| Achado visual ou clínico | Ação sugerida |
|---|---|
| Valgo dinâmico no footwork, chair ou senta-levanta | Reduzir carga/amplitude, cue joelho no segundo dedo, fortalecer controle de quadril. |
| Assimetria de carga em exercício bilateral | Usar feedback visual, reduzir velocidade, considerar exercício unilateral assistido. |
| Dor anterior de joelho com cadeia fechada | Reduzir flexão de joelho, ajustar posição dos pés, revisar carga e progressão. |

### Equilíbrio e idosos

| Achado visual ou clínico | Ação sugerida |
|---|---|
| Oscilação excessiva em pé | Usar apoio manual, base maior, reduzir amplitude e retirar multitarefa. |
| Medo/rigidez com instabilidade | Priorizar confiança, transições lentas e exercícios funcionais simples. |
| Quase queda | Interromper exercício, registrar evento e recomendar reavaliação. |

## Lógica de progressão

Progredir apenas quando a maioria dos critérios estiver presente:

- dor ausente ou dentro do limite definido pelo profissional;
- execução com controle por pelo menos 2 séries ou 6 a 10 repetições;
- compensações leves ou ausentes;
- respiração fluida;
- fadiga aceitável;
- paciente entende o cue principal;
- profissional confirma que o objetivo clínico permite progressão.

## Lógica de regressão

Regredir quando houver:

- perda de alinhamento repetida;
- piora de dor;
- compensação cervical/lombar persistente;
- amplitude maior que o controle disponível;
- instabilidade ou medo;
- fadiga precoce com queda técnica.

## Saída recomendada para o motor de análise

```json
{
  "exercise_id": "ref_footwork",
  "support_level": 1,
  "movement_quality_score": 82,
  "observations": [
    "leve tendência de valgo no joelho direito no retorno",
    "controle excêntrico preservado na maior parte das repetições"
  ],
  "suggested_cues": [
    "alinhar joelho direito ao segundo dedo",
    "reduzir velocidade no retorno do carrinho"
  ],
  "recommended_action": "manter exercício com ajuste técnico",
  "requires_professional_confirmation": true
}
```

## Frases seguras para interface

- "Indicador de apoio à decisão, confirmar com avaliação profissional."
- "Sugestão gerada a partir da análise visual do movimento."
- "Não representa diagnóstico."
- "Ajuste conforme dor, histórico e objetivo clínico."
- "Interrompa se houver piora de sintomas ou sinal de alerta."
