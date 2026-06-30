# PilatesVision Backend

## Objetivo

Backend modular para conectar Supabase, Vision Engine, Clinical Engine, AI Engine e Report Engine.

## Estrutura prevista

```text
backend/
  app/
    api/
      v1/
        patients.py
        assessments.py
        media.py
        reports.py
        vision.py
    core/
      config.py
      security.py
    services/
      patient_service.py
      assessment_service.py
      media_service.py
      vision_service.py
      clinical_service.py
      report_service.py
    repositories/
      patient_repository.py
      assessment_repository.py
    schemas/
      patient.py
      assessment.py
      report.py
    tests/
```

## Decisão

No MVP, Streamlit pode falar diretamente com Supabase para velocidade.

Quando o produto ganhar complexidade, FastAPI assume a camada de backend.

## Princípio

A interface pode mudar. O core clínico e os dados devem permanecer estáveis.
