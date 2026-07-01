# Backend Contract — MediaPipe Processing

## Objetivo

Definir o contrato mínimo para o motor de processamento de imagem do PilatesVision usando MediaPipe Pose.

## Responsabilidade do serviço

O serviço deve:

1. Receber uma avaliação e uma imagem.
2. Baixar/acessar a imagem com segurança.
3. Executar MediaPipe Pose.
4. Retornar landmarks.
5. Calcular métricas biomecânicas básicas.
6. Gerar scores MVP.
7. Gerar insights clínicos preliminares.
8. Persistir resultados no Supabase.

## Entrada

Endpoint sugerido:

```text
POST /assessments/{assessment_id}/process
```

Payload:

```json
{
  "media_id": "uuid",
  "view_type": "front",
  "clinic_id": "uuid",
  "patient_id": "uuid"
}
```

## Saída de sucesso

```json
{
  "assessment_id": "uuid",
  "media_id": "uuid",
  "status": "processed",
  "engine": "mediapipe",
  "engine_version": "mvp-0.1",
  "confidence": 0.92,
  "metrics_count": 8,
  "insights_count": 3
}
```

## Saída de erro

```json
{
  "assessment_id": "uuid",
  "media_id": "uuid",
  "status": "failed",
  "error_code": "NO_POSE_DETECTED",
  "message": "Não foi possível identificar o corpo na imagem. Tente uma foto com corpo inteiro, boa iluminação e fundo simples."
}
```

## Erros previstos

```text
NO_POSE_DETECTED
LOW_CONFIDENCE
INVALID_IMAGE
STORAGE_ACCESS_DENIED
ASSESSMENT_NOT_FOUND
MEDIA_NOT_FOUND
PROCESSING_ERROR
```

## Dependências sugeridas

```text
python
fastapi
uvicorn
mediapipe
opencv-python
numpy
pydantic
supabase
```

## Estrutura sugerida

```text
backend/
  app/
    main.py
    config.py
    api/
      assessments.py
    services/
      mediapipe_pose_service.py
      biomechanical_metrics_service.py
      clinical_score_service.py
      clinical_insight_service.py
      supabase_service.py
    models/
      processing.py
    utils/
      geometry.py
```

## Métricas MVP

### Front view

```text
shoulder_level_difference
pelvic_level_difference
head_tilt_angle
knee_symmetry_difference
global_frontal_alignment
```

### Lateral view

```text
forward_head_estimate
trunk_pelvis_alignment
knee_projection_estimate
ankle_hip_shoulder_alignment
```

## Cálculo geométrico mínimo

Utilizar landmarks normalizados do MediaPipe.

Funções necessárias:

```text
calculate_angle(point_a, point_b, point_c)
calculate_horizontal_difference(point_a, point_b)
calculate_vertical_difference(point_a, point_b)
calculate_distance(point_a, point_b)
normalize_metric(value, expected_range)
```

## Persistência

### pose_landmarks

Salvar:

- assessment_id
- media_id
- engine
- engine_version
- landmarks
- confidence

### biomechanical_metrics

Salvar:

- metric_key
- metric_label
- value
- unit
- side
- confidence
- raw_data

### clinical_scores

Salvar:

- posture_score
- symmetry_score
- global_clinical_score
- scoring_model_version
- explanation

### clinical_insights

Salvar:

- insight_type
- title
- description
- confidence
- severity
- evidence_refs
- suggested_follow_up

## Regras clínicas MVP

### Assimetria de ombros

Se diferença vertical entre ombros ultrapassar limite configurado:

```text
Gerar insight de assimetria escapular/ombros com recomendação de avaliação complementar.
```

### Assimetria pélvica

Se diferença vertical entre cristas/landmarks de quadril ultrapassar limite:

```text
Gerar insight de assimetria pélvica com recomendação de avaliação clínica.
```

### Cabeça anteriorizada

Se vista lateral sugerir projeção anterior da cabeça:

```text
Gerar insight de anteriorização da cabeça com recomendação de avaliar cervical, hábitos posturais e controle escapular.
```

## Princípios de segurança clínica

- Nunca gerar diagnóstico automático.
- Nunca dizer que há patologia com base apenas na imagem.
- Sempre exibir confiança.
- Sempre recomendar revisão profissional.
- Sempre manter rastreabilidade dos cálculos.

## Critério de qualidade

A primeira versão deve priorizar confiabilidade e explicabilidade, não quantidade de métricas.

A meta é ser clinicamente útil sem fingir precisão que o método não tem.
