# Contrato da API Python — PilatesVision

Este contrato define como a aplicacao Lovable/React deve conversar com o motor biomecanico Python.

## Objetivo

Criar uma API externa em Python/FastAPI para executar analises com MediaPipe e OpenCV, devolvendo JSON estruturado para o frontend salvar no Supabase.

## Endpoints

### GET /health

Retorna se a API esta viva.

Resposta esperada:

```json
{
  "status": "ok",
  "service": "pilatesvision-api"
}
```

### POST /analyze/postural-image

Analisa uma imagem postural estatica.

Entrada:

```json
{
  "assessmentId": "uuid-da-avaliacao",
  "studentId": "uuid-do-aluno",
  "clinicId": "uuid-da-clinica",
  "view": "anterior",
  "image": "data:image/jpeg;base64,...",
  "context": "opcional"
}
```

Resposta:

```json
{
  "mode": "postural",
  "score": 82,
  "view": "anterior",
  "metrics": {
    "shoulder_delta_px": 12.4,
    "hip_delta_px": 8.1,
    "knee_alignment_index_px": 10.2
  },
  "findings": [
    {
      "region": "Ombros",
      "description": "Assimetria leve de ombros.",
      "severity": "leve"
    }
  ],
  "alerts": [
    "Confirmar clinicamente a assimetria observada."
  ],
  "annotatedImage": "data:image/jpeg;base64,...",
  "confidence": 0.86,
  "disclaimer": "Resultado de apoio a decisao profissional. Nao substitui avaliacao clinica."
}
```

### POST /analyze/dynamic-video

Analisa um video de movimento.

Entrada:

```json
{
  "assessmentId": "uuid-da-avaliacao",
  "studentId": "uuid-do-aluno",
  "clinicId": "uuid-da-clinica",
  "movement": "Agachamento",
  "video": "data:video/mp4;base64,...",
  "parameters": {
    "minAngle": 70,
    "maxAngle": 175,
    "frameSkip": 2,
    "visibilityMin": 0.5
  }
}
```

Resposta:

```json
{
  "mode": "dynamic",
  "movement": "Agachamento",
  "overallScore": 78,
  "metrics": {
    "controle": 80,
    "estabilidade": 76,
    "simetria": 84,
    "amplitude": 72,
    "conformidade": 81
  },
  "compensations": [
    "Leve valgo dinamico no joelho direito."
  ],
  "frames": {
    "valid": 128,
    "attention": 19
  },
  "timeSeries": [
    {
      "frame": 12,
      "tempo_s": 0.4,
      "joelho_d": 94.2,
      "joelho_e": 97.1
    }
  ],
  "sampleFrames": [
    "data:image/jpeg;base64,..."
  ],
  "disclaimer": "Resultado de apoio a decisao profissional. Nao substitui avaliacao clinica."
}
```

### POST /analyze/exercise-video

Mesmo padrao de `/analyze/dynamic-video`, mas com contexto especifico do exercicio Pilates selecionado.

Entrada adicional sugerida:

```json
{
  "exerciseName": "Hundred",
  "criteria": ["Pelve estavel", "Respiracao coordenada"],
  "commonCompensations": ["Tensao cervical", "Elevacao dos ombros"]
}
```

## Salvamento no Supabase

O frontend deve salvar:

- resposta postural em `postural_results`;
- resposta dinamica em `movement_results`;
- exercicios selecionados em `prescribed_exercises`;
- relatorio em `reports`.

## Campos minimos para a primeira integracao

Para rodar hoje, a primeira versao pode salvar apenas:

### postural_results

- `assessment_id`
- `score`
- `findings`
- `image_urls`

### movement_results

- `assessment_id`
- `controle`
- `estabilidade`
- `simetria`
- `amplitude`
- `movements_evaluated`
- `video_url`

### prescribed_exercises

- `assessment_id`
- `name`
- `level`
- `focus`
- `series`
- `order_index`

### reports

- `assessment_id`
- `clinic_id`
- `student_id`
- `content`
- `version`

## Regras de erro

A API deve retornar erro claro quando:

- imagem/video estiver vazio;
- corpo nao for detectado;
- landmarks tiverem baixa confianca;
- arquivo exceder limite;
- analise falhar.

Formato sugerido:

```json
{
  "error": "LOW_CONFIDENCE",
  "message": "Pontos corporais insuficientes. Refaça a captura com corpo inteiro visivel."
}
```

## Regra de ouro

A API retorna dados objetivos. O frontend transforma esses dados em experiencia clinica premium. O profissional decide.
