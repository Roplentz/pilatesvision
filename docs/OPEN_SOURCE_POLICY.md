# Política Open Source do FisioHub

## Objetivo

Permitir o uso responsável de software, modelos e datasets open source sem comprometer o produto, a propriedade intelectual, a privacidade ou a segurança clínica.

## Classificação de licenças

### Verde — preferencial

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause

Podem ser avaliadas para uso e adaptação, preservando avisos, atribuições e demais condições da licença.

### Amarela — revisão obrigatória

- MPL
- LGPL
- pesos de modelos com licença separada
- datasets acadêmicos
- licenças com restrição comercial, patente ou uso em saúde

Exigem revisão técnica e jurídica antes de qualquer integração.

### Vermelha — bloqueada por padrão

- AGPL incorporada ao SaaS
- GPL incorporada ao núcleo proprietário
- código sem licença explícita
- licença somente para pesquisa
- pesos sem permissão comercial
- datasets sem origem, consentimento ou termos documentados

Uma exceção só pode ser aprovada por decisão registrada da governança do FisioHub.

## Regras de engenharia

1. Nenhum código externo deve ser copiado sem identificar repositório, commit e licença.
2. Código, pesos e datasets devem ser avaliados separadamente.
3. Dependências transitivas também devem ser inventariadas.
4. Protocolos clínicos não podem depender diretamente de um estimador de pose específico.
5. Resultados de projetos acadêmicos não devem ser apresentados como clinicamente validados sem validação própria.
6. Toda métrica deve registrar versão do algoritmo, limitações e qualidade mínima da captura.
7. Componentes experimentais devem ficar atrás de feature flags ou em diretórios de experimentos.

## Decisões atuais

### Usar

- MediaPipe Tasks
- OpenCV
- FastAPI
- Supabase
- React-PDF Renderer
- Recharts

### Adaptar

- Sports2D
- padrões do FastAPI Full-Stack Template
- componentes MIT do gaitmap
- modelo FHIR do Medplum

### Estudar

- Pose2Sim
- OpenCap
- OpenSim
- MMPose e RTMPose
- MoveNet
- RehabExerAssess
- ST-GCN para exercícios de reabilitação

### Não incorporar diretamente

- FreeMoCap
- gaitmap_mad
- Kinovea
- projetos sem licença
- demos sem validação e rastreabilidade
