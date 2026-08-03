# @fisiohub/fmip-core

Fundação da FisioHub Motion Intelligence Platform (FMIP).

Este pacote organiza módulos independentes de captura, qualidade, pose, movimento, eventos, biomecânica, protocolos, revisão clínica e relatórios. Ele não executa visão computacional diretamente e não substitui `@fisiohub/motion-core`.

## Objetivos

- permitir que PilatesVision, PostureVision e GaitVision compartilhem a mesma arquitetura;
- registrar módulos por domínio e estágio;
- executar pipelines com proveniência e fallback controlado;
- separar módulos experimentais, validados e depreciados;
- impedir acoplamento entre produto, estimador de pose e interpretação clínica.

## Regra de segurança

Falhas em módulos opcionais podem ser registradas como alertas. Falhas em módulos obrigatórios interrompem o pipeline. Nenhuma etapa clínica deve ser executada sem aprovação prévia do Quality Gate definido pelo protocolo.
