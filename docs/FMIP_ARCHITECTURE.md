# FisioHub Motion Intelligence Platform

## Papel

A FMIP é a camada de orquestração dos produtos de avaliação do FisioHub. O Motion Core representa e mede movimento; a FMIP organiza produtos, protocolos, módulos, proveniência, validação e publicação dos resultados.

## Produtos iniciais

- PilatesVision
- PostureVision
- GaitVision
- SportsVision

## Pipeline canônico

```text
Capture
→ Quality Gate
→ Pose Adapter
→ Motion Schema
→ Temporal/Event Engine
→ Biomechanics
→ Protocol Engine
→ Clinical Review
→ Report
```

## Separação de responsabilidades

- `@fisiohub/motion-core`: landmarks, séries, geometria, qualidade, eventos e métricas.
- `@fisiohub/fmip-core`: registro de módulos, pipeline, proveniência e catálogo de produtos.
- aplicações React: captura, experiência clínica, revisão e visualização.
- Supabase: identidade, RLS, dados transacionais, Storage e auditoria.
- FastAPI futuro: OpenCV, RTMPose, Sports2D, jobs pesados e multicâmera.

## Regras

1. Nenhum produto acessa diretamente índices de um estimador de pose.
2. Nenhum módulo clínico executa sem qualidade mínima aprovada.
3. Toda etapa registra motor, versão, horário e alertas.
4. Módulos experimentais não geram diagnóstico automático.
5. A falha de um módulo opcional não pode derrubar o produto.
6. A falha de uma etapa obrigatória interrompe a análise com justificativa.
7. Produtos compartilham o Core, mas mantêm protocolos e relatórios próprios.

## Próximas entregas

1. integrar contratos do Motion Core sem alterar o app;
2. criar `PostureProtocol` e `GaitProtocol` experimentais;
3. criar Benchmark Registry para MediaPipe, DWPose e RTMPose;
4. criar Dataset Registry e Assessment Bundle;
5. criar adaptadores FHIR para Observation e DiagnosticReport;
6. integrar ao PilatesVision somente por feature flag após validação.
