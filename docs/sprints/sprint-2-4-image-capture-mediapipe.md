# Sprint 2.4 — Captura de Imagem, MediaPipe e Primeira Análise Postural

## Objetivo

Implementar o primeiro fluxo inteligente do PilatesVision:

```text
Paciente
↓
Nova avaliação
↓
Upload/captura de imagem
↓
Armazenamento seguro
↓
Processamento MediaPipe
↓
Landmarks
↓
Métricas biomecânicas iniciais
↓
Scores MVP
↓
Insights clínicos preliminares
```

Este sprint transforma o produto de sistema cadastral em plataforma clínica com visão computacional.

## Escopo incluído

- Tela de nova avaliação postural.
- Upload de imagem frontal e lateral.
- Salvamento no bucket `assessment-media`.
- Registro em `assessment_media`.
- Processamento com MediaPipe Pose.
- Persistência dos landmarks em `pose_landmarks`.
- Cálculo de métricas biomecânicas básicas.
- Persistência em `biomechanical_metrics`.
- Geração de scores MVP.
- Geração de insights simples e explicáveis.

## Fora do escopo

- Análise de marcha.
- Vídeo dinâmico completo.
- Relatório PDF final.
- Prescrição automática.
- Diagnóstico automático.
- Modelo 3D avançado.

## Rotas recomendadas

```text
/patients/:patientId/assessments/new
/assessments/:assessmentId
/assessments/:assessmentId/results
```

## Componentes front-end

### AssessmentNewPage

Responsável por iniciar uma nova avaliação.

### ImageCaptureUploader

Responsável por:

- upload de foto;
- captura por câmera, se disponível;
- validação de formato;
- preview;
- envio ao Supabase Storage.

### AssessmentProcessingStatus

Estados:

```text
uploaded
processing
processed
failed
```

### PosturalAnalysisViewer

Mostra:

- imagem original;
- imagem processada/anotada;
- principais landmarks;
- métricas calculadas;
- confiança;
- insights.

## Motor clínico MVP

### Entrada

```json
{
  "assessment_id": "uuid",
  "media_id": "uuid",
  "image_url": "private signed url",
  "view_type": "front | lateral | posterior"
}
```

### Saída

```json
{
  "landmarks": {},
  "metrics": [],
  "scores": {},
  "insights": [],
  "confidence": 0.0
}
```

## Métricas biomecânicas MVP

### Vista frontal

- alinhamento dos ombros;
- alinhamento da pelve;
- inclinação da cabeça;
- simetria dos joelhos;
- alinhamento global direita/esquerda.

### Vista lateral

- cabeça anteriorizada;
- alinhamento tronco-pelve;
- inclinação pélvica aproximada;
- projeção do joelho;
- alinhamento tornozelo-quadril-ombro.

## Scores MVP

### Posture Score

Baseado em:

- alinhamento global;
- assimetria ombros/pelve;
- cabeça anteriorizada;
- desvios detectáveis.

### Symmetry Score

Baseado em:

- diferença ombros;
- diferença pelve;
- diferença joelhos;
- distribuição visual direita/esquerda.

### Confidence Score

Baseado em:

- qualidade dos landmarks;
- quantidade de landmarks detectados;
- visibilidade dos pontos-chave;
- consistência da imagem.

## Insights clínicos MVP

Exemplos:

```text
Foi observada assimetria entre os ombros. Recomenda-se complementar a avaliação com inspeção clínica e testes funcionais específicos.
```

```text
A análise sugere anteriorização da cabeça na vista lateral. Considere avaliar mobilidade cervical, controle escapular e hábitos posturais.
```

Regras:

- Não diagnosticar.
- Não substituir avaliação clínica.
- Sempre indicar confiança.
- Sempre permitir revisão pelo fisioterapeuta.

## Pipeline técnico

```text
Front-end
↓
Supabase Storage
↓
assessment_media
↓
FastAPI / Processing Function
↓
MediaPipe Pose
↓
pose_landmarks
↓
biomechanical_metrics
↓
clinical_scores
↓
clinical_insights
↓
Results Page
```

## Endpoints sugeridos

```text
POST /assessments
POST /assessments/{id}/media
POST /assessments/{id}/process
GET /assessments/{id}/results
```

## Critérios de aceite

- [ ] Usuário cria uma nova avaliação para um paciente.
- [ ] Usuário envia imagem frontal ou lateral.
- [ ] Imagem é salva no storage correto.
- [ ] Registro é criado em `assessment_media`.
- [ ] Processamento MediaPipe retorna landmarks.
- [ ] Landmarks são persistidos em `pose_landmarks`.
- [ ] Métricas básicas são calculadas.
- [ ] Scores MVP são gerados.
- [ ] Insights preliminares são exibidos.
- [ ] Sistema mostra erro claro se a imagem for inadequada.

## Decisão arquitetural

A primeira análise deve ser simples e confiável. Melhor medir pouco e bem do que medir muito e virar horóscopo biomecânico.

## Resultado esperado

Ao final do Sprint 2.4, o PilatesVision deve realizar sua primeira avaliação postural automatizada baseada em imagem.
