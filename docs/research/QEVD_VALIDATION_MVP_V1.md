# Validação de Pesquisa — Motor Biomecânico MVP v1 sobre QEVD-FIT-COACH-Benchmark

> **Uso exclusivamente interno, para pesquisa/validação.** Nenhum vídeo, frame ou
> anotação do dataset é redistribuído, publicado, commitado ou enviado ao Supabase.
> Nada é associado a pacientes. Os thresholds do Motor v1 **não** foram alterados
> antes desta medição de linha de base.

## 1. Metadados

- **Data da execução:** 2026-07-11
- **Commit do repositório:** `bdbdd50`
- **Motor:** `mediapipe-pose-landmarker` — versão `tasks-vision-0.10.35/lite`
  (constante `ENGINE_VERSION` em `src/lib/poseMetrics.ts`)
- **Schema de métricas:** `biomechanics-mvp-v1`
- **Dataset:** QEVD-FIT-COACH-Benchmark (split de benchmark, 74 vídeos)
  <https://huggingface.co/datasets/Voxel51/qualcomm-exercise-video-dataset-benchmark>
- **Paper:** Yin et al., *"QEVD: A Fitness Coaching Video Dataset"*, arXiv:2407.08101
- **Licença:** Qualcomm Data Research License (Feb 25, 2025) —
  <https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/Dataset-Research-License-Feb-25-2025.pdf>
  Uso restrito a pesquisa não comercial. Citação obrigatória: Qualcomm (curator)
  e paper acima.

## 2. Protocolo

1. Download apenas dos metadados (`samples.json`, `metadata.json`, `README.md`)
   e de **6 vídeos** (IDs `0006`, `0009`, `0010`, `0011`, `0031`, `0039`) para
   diretório temporário fora do repositório (`/tmp/qevd/`).
2. Seleção de **10 trechos de 5 s a 13 s** (ver §4), preservando ID e timestamps
   de origem. Recorte lógico via `cv2.CAP_PROP_POS_FRAMES` na hora da extração
   de landmarks — nenhum arquivo derivado de vídeo foi persistido em disco além
   do MP4 original em `/tmp/qevd/videos/`.
3. Extração de landmarks: `scripts/research/qevd/../extract_landmarks.py`
   ([snippet reproduzível abaixo](#anexo-a--script-de-extração)) roda
   MediaPipe Tasks **PoseLandmarker Lite 0.10.35** (Python) no modo `VIDEO`,
   `num_poses=1`. É o mesmo modelo (`pose_landmarker_lite.task`) referenciado
   pela versão Web `@mediapipe/tasks-vision@0.10.35` usada em produção. Não
   houve troca silenciosa de modelo. Ambiente headless do sandbox exige
   `libGLESv2.so` (fornecida via nix `libglvnd`); nenhuma alteração no
   navegador de produção.
4. Cálculo de métricas: `scripts/research/qevd/run_metrics.ts` importa
   `sampleFromLandmarks` e `summarizeSamples` diretamente de
   `src/lib/poseMetrics.ts`. Detector (`DEFAULT_DETECTOR`), filtro EMA
   zero-fase e limiares permaneceram intactos.
5. Nenhuma amostra do dataset foi utilizada para calibrar o motor antes desta
   medição.

## 3. Amostras selecionadas

Categorias: `regular` = agachamentos padrão; `variacao` = variações rotuladas
pelo dataset (squat jumps, squat kicks); `qualidade_reduzida` = trechos curtos
(5 s) próximos ao final da série, com menor amostragem; `nao_agachamento` =
outros exercícios para teste de falso positivo.

| ID  | Vídeo | Início (s) | Fim (s) | Categoria | Exercício rotulado | Reps de referência | Origem da referência |
| --- | ----- | ---------- | ------- | --------- | ------------------ | ------------------ | -------------------- |
| S01 | 0006 | 68.0 | 78.0 | regular | squats | — | dataset não fornece contagem neste trecho |
| S02 | 0009 | 65.0 | 78.0 | regular | squats | 5 | eventos de contagem "5" (67.07 s) e "10" (77.37 s) |
| S03 | 0010 | 68.0 | 78.0 | regular | squats | — | dataset não fornece contagem |
| S04 | 0011 | 68.0 | 78.0 | regular | squats | — | dataset não fornece contagem |
| S05 | 0039 | 69.0 | 79.0 | variacao | squat jumps | 5 | contagens "5" (69.3 s) e "10" (73.87 s) |
| S06 | 0031 | 90.0 | 100.0 | variacao | squat kicks | — | dataset não fornece contagem |
| S07 | 0010 | 80.5 | 85.5 | qualidade_reduzida | squats | — | janela curta 5 s no fim da série |
| S08 | 0011 | 82.5 | 87.5 | qualidade_reduzida | squats | — | janela curta 5 s no fim da série |
| S09 | 0006 | 90.0 | 100.0 | nao_agachamento | pushups | 0 | rótulo do dataset — não é agachamento |
| S10 | 0006 | 40.0 | 50.0 | nao_agachamento | jumping jacks | 0 | rótulo do dataset — não é agachamento |

## 4. Resultados por trecho

Colunas: `reps_valid` = repetições que passaram pelo critério de validade do
motor (confiança + amplitude + duração); `MedRangeL/R` = mediana da amplitude
de flexão de joelho (graus) por repetição válida; `TrunkP95` = mediana do P95
de inclinação de tronco; `Sym` = mediana da simetria bilateral (0–1);
`Rejeitada` = motor não retornou nenhuma repetição válida.

| ID | Categoria | Frames válidos/total | Conf. média | Reps detectadas | Reps válidas | Ref. | MedRangeL | MedRangeR | TrunkP95 | Sym | Rejeitada | Motivo |
| -- | --------- | -------------------- | ----------- | --------------- | ------------ | ---- | --------- | --------- | -------- | --- | --------- | ------ |
| S01 | regular | 301/301 | 0.99 | 1 | 1 | — | 23.9 | 22.5 | 89.8 | 0.94 | não | — |
| S02 | regular | 391/391 | 0.99 | 6 | 6 | 5 | 61.5 | 73.6 | 88.8 | 0.84 | não | — |
| S03 | regular | 301/301 | 0.99 | 0 | 0 | — | 0 | 0 | 0 | 0 | **sim** | nenhuma repetição válida |
| S04 | regular | 301/301 | 0.99 | 0 | 0 | — | 0 | 0 | 0 | 0 | **sim** | nenhuma repetição válida |
| S05 | variacao (squat jumps) | 301/300 | 0.99 | 2 | 2 | 5 | 42.0 | 44.7 | 61.9 | 0.94 | não | — |
| S06 | variacao (squat kicks) | 301/301 | 0.98 | 3 | 3 | — | 34.6 | 33.1 | 66.5 | 0.90 | não | — |
| S07 | qualidade_reduzida | 151/151 | 0.99 | 0 | 0 | — | 0 | 0 | 0 | 0 | **sim** | nenhuma repetição válida |
| S08 | qualidade_reduzida | 151/151 | 0.95 | 1 | 1 | — | 61.2 | 59.7 | 84.1 | 0.97 | não | — |
| S09 | nao_agachamento (pushups) | 301/274 | 0.76 | 1 | 1 | 0 | 22.4 | 28.4 | 87.1 | 0.79 | não | **falso positivo** |
| S10 | nao_agachamento (jumping jacks) | 301/301 | 0.98 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | sim | comportamento esperado |

> Valores completos, por-repetição, e o `AutoMetricsSummary` bruto de cada
> trecho estão em `/tmp/qevd/out/results.json` (não versionado, contém
> derivados do dataset licenciado).

## 5. Métricas agregadas

**Observado (não inferido):**

- **Sensibilidade de detecção de repetição** (≥ 1 rep válida em agachamentos e
  variações): **5/8 = 62.5 %** (S03, S04, S07 não produziram nenhuma rep válida).
- **Erro absoluto de contagem** (apenas trechos com referência):
  - S02 (referência 5): detectou 6 → |erro| = 1
  - S05 (referência 5): detectou 2 → |erro| = 3
  - **MAE = 2.0** repetições (n = 2 — amostra muito pequena).
- **Falsos positivos em não-agachamentos:** **1/2** (S09 pushups: 1 rep válida).
- **Taxa de análises rejeitadas** (nenhuma rep válida): **4/10 = 40 %** — três
  dessas rejeições são de trechos rotulados como agachamento (falsos negativos)
  e uma é o comportamento esperado no jumping jacks.

**Inferido (a confirmar em amostra maior):**

- O detector é sensível a agachamentos com trajetória vertical clara do
  quadril, mas se degrada quando o participante executa agachamentos com
  ritmo/amplitude atípicos ou quando o vídeo é de baixa resolução
  (640×360). A ausência de rep válida em S03/S04 sugere que a heurística de
  histerese (baseline P10 + `peak_ratio` 0.5, `release_ratio` 0.2) pode ser
  restritiva para amplitudes moderadas.
- Squat jumps (S05) subestimou reps porque a trajetória vertical é dominada
  pelo salto e o "topo" acima do baseline confunde a detecção de retorno.
- Pushup gerou 1 rep válida devido ao movimento cíclico vertical do quadril na
  visão lateral; o critério de validade não usa nenhuma verificação de
  postura (por ex. joelho estendido) para descartar não-agachamentos.

## 6. Limitações

- **n = 10 trechos** de 6 vídeos — insuficiente para conclusões estatísticas.
  Serve como linha de base para calibração posterior.
- Dataset não fornece contagem de repetições ground-truth para todos os
  trechos escolhidos; só S02 e S05 têm eventos de contagem confiáveis.
- Resolução baixa (640×360) e vista frontal única — o dataset não tem
  variantes de baixa qualidade rotuladas, então a categoria
  `qualidade_reduzida` foi construída reduzindo a janela para 5 s (menor
  amostragem), o que é uma proxy imperfeita.
- Extração de landmarks foi feita em Python (mesma versão de modelo que a Web),
  mas o pipeline de decodificação (OpenCV) difere do `<video>` HTML da
  produção. Diferenças de timing/decoder podem introduzir variação marginal
  em `t`.
- Sem revisão clínica manual desta base; a coluna `Ref.` reflete apenas
  contagens do próprio dataset.

## 7. Plano de calibração

Fica registrado, sem alterar código: as próximas iterações do motor deveriam
considerar (a) reduzir `peak_ratio` para 0.35 e revisar `release_ratio` para
capturar agachamentos com menor amplitude; (b) adicionar filtro de
"não-agachamento" baseado em ângulo médio de joelho no topo e razão de
deslocamento tronco/quadril; (c) tratar squat jumps como sub-classe com
baseline dinâmico. Estas mudanças exigem uma amostra maior (≥ 40 trechos com
ground truth confiável) antes de serem promovidas.

## 8. Reprodutibilidade

1. Baixar metadados e vídeos IDs `0006 0009 0010 0011 0031 0039` para
   `/tmp/qevd/videos/` (não versionar).
2. Baixar `pose_landmarker_lite.task` de
   `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/`.
3. Rodar `python3 scripts/research/qevd/extract_landmarks.py` (requer
   `mediapipe==0.10.35`, `opencv-python-headless`, `libGLESv2`).
4. Rodar `bun run scripts/research/qevd/run_metrics.ts`. Saídas em
   `/tmp/qevd/out/` (`results.json`, `results.csv`).
5. O CSV enxuto versionado deste relatório está em
   `docs/research/qevd_validation_mvp_v1.csv` — contém apenas IDs, timestamps
   e métricas agregadas; **não** contém mídia nem dados pessoais.

### Anexo A — script de extração

Reprodução do `/tmp/qevd/extract_landmarks.py` (não versionado, roda em
diretório temporário):

```python
import json, os, cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

opts = mp_vision.PoseLandmarkerOptions(
    base_options=mp_python.BaseOptions(
        model_asset_path="/tmp/qevd/pose_landmarker_lite.task"),
    running_mode=mp_vision.RunningMode.VIDEO,
    num_poses=1,
)
# para cada trecho do plano: cap.set(POS_FRAMES=start), loop até end,
#   pl.detect_for_video(mpimg, int(t*1000)) e serializar landmarks
```

---

*Estimativa 2D — apoio à decisão de pesquisa. Não é diagnóstico. Nenhum dado
de paciente foi utilizado.*