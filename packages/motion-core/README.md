# @fisiohub/motion-core

Núcleo independente de representação e processamento biomecânico do FisioHub.

## Objetivo

Separar o motor de movimento do produto PilatesVision. O aplicativo continua responsável por captura, interface e fluxo clínico; este pacote passa a concentrar contratos de dados e funções determinísticas reutilizáveis.

## Módulos iniciais

- `schema.ts`: FH Motion Schema v1.0 em TypeScript.
- `geometry.ts`: primitivas geométricas 2D.
- `temporal.ts`: interpolação, suavização e derivadas.
- `quality.ts`: primeiro Quality Gate independente.
- `motion-core.test.ts`: testes determinísticos do núcleo.

## Regra arquitetural

Nenhum produto FisioHub deve depender diretamente do formato de landmarks de MediaPipe, RTMPose ou outro motor. Cada motor de pose deverá ser convertido para `MotionFrame` por um adapter.

## Migração segura

1. Manter `src/lib/poseMetrics.ts` funcionando durante o MVP.
2. Cobrir os cálculos atuais com testes de caracterização.
3. Migrar funções matemáticas puras para este pacote.
4. Criar `MediaPipePoseAdapter`.
5. Alterar o PilatesVision para consumir o pacote.
6. Remover duplicações apenas depois do QA ponta a ponta.

## Estado

Versão inicial `0.1.0`. Ainda não contém interpretação clínica, diagnóstico ou recomendação terapêutica.
