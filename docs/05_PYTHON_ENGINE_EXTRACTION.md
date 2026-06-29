# Extracao do motor Python — PilatesVision

## Papel

O motor Python deve concentrar a biomecanica: MediaPipe, OpenCV, leitura de imagem e video, calculo de angulos, analise de simetria, metricas de estabilidade, frames anotados e retorno JSON estruturado para o frontend.

## Base inicial

Usar o MVP Streamlit anterior como fonte tecnica:

- postural.py
- dynamic.py
- pose_utils.py
- clinical_tests.py
- exercises.py

Nao copiar a interface Streamlit. Extrair apenas a logica clinica e os calculos.

## Servico alvo

Criar um servico Python com:

- health check;
- analise de imagem postural;
- analise de video dinamico;
- analise de video por exercicio.

## Sequencia

1. Criar servico minimo.
2. Migrar funcoes utilitarias de pose.
3. Migrar analise postural.
4. Migrar analise dinamica.
5. Padronizar respostas em JSON.
6. Publicar o servico.
7. Conectar a aplicacao Lovable.

## Regra clinica

O retorno deve ser objetivo e prudente. O sistema apoia a decisao profissional, mas nao substitui avaliacao clinica.
