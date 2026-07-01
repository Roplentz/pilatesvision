# Auditoria de Código Nível 2 — `Roplentz/pilatesvision-app-`

## Objetivo

Auditar o aplicativo Streamlit real publicado como `pilatesvision.streamlit.app` e avaliar o que deve ser aproveitado, refatorado ou migrado para o repositório principal `Roplentz/pilatesvision`.

## Correção de diagnóstico

A auditoria inicial do `pilatesvision-app-` havia indicado baixo valor técnico por ausência de resultados na busca indexada. Após inspeção direta dos arquivos, o diagnóstico muda de forma importante.

O repositório `Roplentz/pilatesvision-app-` contém um MVP Streamlit funcional, com avaliação postural, avaliação dinâmica, biblioteca de exercícios, persistência local, relatório textual, MediaPipe, OpenCV e integração planejada com Supabase.

## Estrutura identificada

```text
PILATESVISION-APP-
├── .devcontainer
├── .streamlit
├── .venv
├── data
├── docs
├── modules
├── pages
├── tools
├── app.py
├── packages.txt
├── README.md
├── requirements.txt
├── supabase_schema.sql
```

## Achados principais

### 1. App Streamlit principal

Arquivo:

```text
app.py
```

Status: manter e refatorar.

O arquivo contém:

- interface Streamlit;
- CSS customizado;
- menu lateral;
- cadastro/anamnese de paciente;
- avaliação postural;
- avaliação dinâmica;
- biblioteca de exercícios;
- relatório;
- histórico;
- conexão com módulos clínicos.

Ponto forte: fluxo MVP quase completo em uma aplicação funcional.

Ponto fraco: `app.py` concentra muita responsabilidade e precisa ser dividido em camadas menores.

Classificação:

```text
🟡 Refatorar
```

### 2. Dependências

Arquivo:

```text
requirements.txt
```

Dependências identificadas:

- streamlit
- numpy<2
- opencv-python-headless
- mediapipe==0.10.14
- pandas
- plotly
- streamlit-webrtc
- av
- supabase

Ponto forte: stack adequada para MVP de visão computacional.

Ponto de atenção: `mediapipe==0.10.14` e `numpy<2` devem ser mantidos para compatibilidade.

Classificação:

```text
🟢 Manter
```

### 3. Avaliação postural

Arquivo:

```text
modules/postural.py
```

Status: manter como base do Pose/Postural Engine MVP.

O módulo já executa:

- MediaPipe Pose em imagem estática;
- análise de vista anterior;
- análise de vista lateral;
- análise de vista posterior;
- marcação visual em imagem;
- cálculo de assimetria de ombros;
- cálculo de assimetria pélvica;
- índice frontal de joelhos;
- estimativa de cabeça anteriorizada;
- escore postural simples;
- alertas clínicos de apoio.

Ponto forte: já entrega valor clínico visual.

Ponto de atenção: métricas usam pixels e precisam evoluir para normalização por escala corporal e explicabilidade maior.

Classificação:

```text
🟢 Manter e evoluir
```

### 4. Avaliação dinâmica

Arquivo:

```text
modules/dynamic.py
```

Status: manter como base do Dynamic Movement Engine.

O módulo já executa:

- processamento de vídeo com OpenCV;
- MediaPipe Pose em vídeo;
- cálculo de ângulos por exercício;
- análise por frames;
- cálculo de conformidade;
- estabilidade;
- simetria;
- velocidade global da pose;
- amostras de frames;
- suporte a câmera ao vivo via `streamlit-webrtc`.

Ponto forte: já possui lógica prática de análise dinâmica.

Ponto de atenção: precisa persistir landmarks/métricas em Supabase e separar processamento da interface.

Classificação:

```text
🟢 Manter e modularizar
```

### 5. Motor biomecânico

Arquivo:

```text
modules/biomechanical_engine.py
```

Status: manter como embrião do Clinical Score Engine.

O módulo já calcula:

- qualidade do sinal;
- amplitude;
- estabilidade;
- simetria;
- controle;
- score final;
- achados;
- recomendações;
- resumo clínico.

Ponto forte: já se aproxima da visão definida no Clinical Intelligence Layer.

Ponto de atenção: recomendações precisam ser classificadas como apoio à decisão, com rastreabilidade, versão e nível de confiança.

Classificação:

```text
🟢 Manter e evoluir
```

### 6. Biblioteca de exercícios

Arquivo:

```text
data/exercises.py
```

Status: manter como primeira versão da Exercise Knowledge Base.

Exercícios identificados:

- Agachamento
- Ponte
- Hundred
- Roll Up
- Single Leg Stretch
- Swan
- Swimming
- Lunge
- Apoio Unipodal
- Sentar e Levantar

Cada exercício contém:

- categoria;
- nível;
- vista ideal;
- articulações;
- landmarks/pontos;
- limites angulares padrão;
- compensações;
- critérios de qualidade;
- feedback.

Ponto forte: já existe conhecimento clínico estruturado.

Ponto de atenção: deve migrar para base versionada, possivelmente JSON/YAML ou tabela Supabase.

Classificação:

```text
🟢 Manter e transformar em Knowledge Base
```

### 7. Persistência clínica

Arquivos:

```text
modules/clinical_persistence.py
modules/local_store.py
```

Status: refatorar.

O app salva pacientes, avaliações e relatórios em arquivos JSON locais dentro de `data/runtime`.

Ponto forte: permitiu validar rápido o MVP.

Ponto fraco: não serve para produção clínica, multiusuário, LGPD ou uso em nuvem confiável.

Ação recomendada: substituir por Supabase usando o schema do repositório principal.

Classificação:

```text
🟡 Refatorar para Supabase
```

### 8. Schema Supabase legado

Arquivo:

```text
supabase_schema.sql
```

Status: estudar/migrar parcialmente.

O schema legado contém:

- clinics
- professionals
- students
- assessments
- postural_results
- movement_results
- reports
- RLS básico

Ponto forte: confirma intenção multi-clínica.

Ponto de atenção: o schema novo do repositório principal é mais robusto e deve ser a fonte da verdade.

Ação recomendada: usar o novo schema de `Roplentz/pilatesvision`, migrando conceitos úteis do schema legado.

Classificação:

```text
🟡 Migrar parcialmente
```

### 9. Relatório textual

Arquivo:

```text
modules/report.py
```

Status: refatorar.

O app já gera relatório textual com:

- dados do aluno;
- avaliação postural;
- análise dinâmica;
- prescrição orientada;
- aviso clínico.

Ponto forte: entrega MVP simples.

Ponto fraco: ainda não é PDF, não tem layout profissional, assinatura, QR Code ou imagem anotada.

Classificação:

```text
🟡 Refatorar para Report Engine
```

## O que já está pronto de verdade

| Módulo | Status real |
|---|---|
| Streamlit app | Funcional |
| Cadastro/anamnese | Funcional em sessão/local |
| Avaliação postural por foto | Funcional |
| MediaPipe imagem | Funcional |
| Avaliação dinâmica por vídeo | Funcional |
| Câmera ao vivo | Parcial/funcional se dependências estiverem ok |
| Biblioteca de exercícios | Funcional |
| Motor biomecânico inicial | Funcional |
| Relatório TXT | Funcional |
| Histórico | Funcional local |
| Supabase | Planejado/parcial |
| RLS | Schema legado + novo schema no repo principal |
| PDF profissional | Não implementado |
| Multiusuário robusto | Não implementado |
| Dashboard SaaS | Não implementado |

## Decisão estratégica

O `pilatesvision-app-` deve ser tratado como:

```text
Base funcional do Alpha 0.1
```

O `Roplentz/pilatesvision` deve ser tratado como:

```text
Repositório principal, arquitetura oficial e fonte da verdade
```

## Estratégia recomendada

### Não reconstruir do zero

A lógica de visão computacional, avaliação dinâmica, biblioteca de exercícios e motor biomecânico já existe e deve ser reaproveitada.

### Consolidar no repositório principal

Migrar gradualmente o código útil do `pilatesvision-app-` para `Roplentz/pilatesvision`, mantendo:

```text
Roplentz/pilatesvision = produto oficial
Roplentz/pilatesvision-app- = protótipo funcional/legado
```

## Plano de migração Alpha 0.1

### Alpha 0.1.1 — Preservar MVP funcional

- Congelar `pilatesvision-app-` como baseline.
- Garantir que o app publicado continue rodando.
- Não quebrar o Streamlit atual.

### Alpha 0.1.2 — Migrar módulos clínicos

Migrar para o repo principal:

- `modules/postural.py`
- `modules/dynamic.py`
- `modules/biomechanical_engine.py`
- `modules/pose_utils.py`
- `data/exercises.py`

### Alpha 0.1.3 — Substituir persistência local

Trocar:

```text
data/runtime/*.json
```

por:

```text
Supabase tables
```

### Alpha 0.1.4 — Refatorar interface

Separar `app.py` em:

```text
app.py
pages/
components/
services/
modules/
```

### Alpha 0.1.5 — Report Engine

Transformar relatório TXT em:

- relatório HTML/PDF;
- imagem anotada;
- scores;
- assinatura profissional;
- QR/hash.

## Riscos

1. Migrar tudo de uma vez pode quebrar o app funcional.
2. Persistência local não serve para produção.
3. Métricas em pixels precisam normalização.
4. Falta autenticação Streamlit/Supabase bem amarrada.
5. O app atual é monolítico demais para escalar.

## Recomendação final

O `pilatesvision-app-` é valioso. Ele não deve ser descartado.

A decisão correta é:

```text
Aproveitar o motor clínico e a experiência Streamlit.
Migrar a arquitetura para o repositório principal.
Substituir persistência local por Supabase.
Evoluir relatório e dashboard.
```

Frase guia:

```text
Não jogar fora o que já enxerga, mede e entrega valor. Vamos dar coluna vertebral de produto a esse MVP.
```
