# PilatesVision — Missão Executiva 001

## Objetivo estratégico

Transformar o PilatesVision em uma plataforma inteligente de avaliação clínica e funcional baseada em visão computacional, IA clínica e banco de dados evolutivo.

O PilatesVision não deve ser tratado apenas como um aplicativo isolado. Ele será o primeiro módulo de um motor maior de análise funcional do FisioHub.

## Tese central

Não vamos construir tudo do zero.

Vamos usar o que já existe de melhor no ecossistema open source, especialmente no GitHub, e concentrar energia no diferencial proprietário:

- inteligência clínica;
- experiência do fisioterapeuta;
- ontologia funcional;
- relatórios evolutivos;
- integração com evidências;
- prescrição orientada;
- segurança e privacidade.

## Visão de produto

O PilatesVision será o primeiro produto da família Vision do FisioHub.

Possíveis extensões futuras:

- PilatesVision;
- OrthoVision;
- NeuroVision;
- GaitVision;
- SportsVision;
- RespiratoryVision.

Todos devem compartilhar o mesmo núcleo tecnológico.

## Princípio de arquitetura

Um único motor, vários produtos.

```text
Vision Engine
  -> Pose Engine
  -> Movement Engine
  -> Clinical Engine
  -> AI Engine
  -> Report Engine
  -> Dashboard
```

## Decisão executiva

O ativo principal do PilatesVision não é a tela.

O ativo principal é o motor clínico-biomecânico capaz de transformar fotos, vídeos e dados clínicos em indicadores úteis para decisão fisioterapêutica.

## Camadas principais

### 1. Vision Engine
Responsável por receber imagens e vídeos, organizar arquivos, padronizar entrada e preparar dados para análise.

### 2. Pose Engine
Responsável por detectar pontos anatômicos e estimar pose corporal.

Candidatos open source a avaliar:

- MediaPipe;
- MoveNet;
- YOLO Pose;
- OpenPose.

### 3. Movement Engine
Responsável por calcular métricas biomecânicas simples:

- ângulos articulares;
- amplitude de movimento;
- simetria;
- velocidade;
- estabilidade;
- compensações;
- trajetória do movimento.

### 4. Clinical Engine
Diferencial proprietário do FisioHub.

Responsável por interpretar os achados biomecânicos com linguagem clínica.

Exemplos:

- anteriorização cervical;
- assimetria de ombros;
- inclinação pélvica;
- limitação de mobilidade;
- compensação durante exercício;
- risco funcional;
- sugestão de conduta fisioterapêutica.

### 5. AI Engine
Responsável por apoiar a interpretação, gerar sínteses, sugerir hipóteses e organizar relatórios.

Deve operar como apoio à decisão, não como substituto do fisioterapeuta.

### 6. Report Engine
Responsável por gerar relatórios claros, comparativos e evolutivos.

### 7. Dashboard
Interface para fisioterapeutas, gestores e, futuramente, pacientes.

## Dados clínicos essenciais

O sistema deverá armazenar:

- paciente;
- profissional;
- avaliação;
- fotos;
- vídeos;
- landmarks;
- métricas biomecânicas;
- dor;
- diagnóstico fisioterapêutico;
- condutas;
- exercícios prescritos;
- evolução por sessão;
- relatórios.

## Ontologia clínica inicial

Exemplo de raciocínio estruturado:

```text
Paciente
  -> apresenta dor
  -> no ombro direito
  -> durante abdução
  -> acima de 90 graus
  -> associada a limitação funcional
  -> interpretada pelo fisioterapeuta
  -> vinculada a plano terapêutico
  -> monitorada ao longo do tempo
```

## Regra estratégica

Antes de desenvolver qualquer componente, aplicar a regra:

1. Existe solução open source madura?
2. A licença permite uso?
3. Podemos adaptar?
4. Podemos integrar?
5. Só então desenvolver do zero.

## Entregável desta missão

Criar a base documental e estratégica do PilatesVision no GitHub, incluindo:

- arquitetura do MVP;
- plano do Open Intelligence Scanner;
- backlog executivo;
- critérios de avaliação de repositórios open source;
- mapa de sprints.

## Status

Missão criada.

Próximo passo: implementar o scanner e iniciar a curadoria de projetos open source relevantes.
