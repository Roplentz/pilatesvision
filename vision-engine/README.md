# Vision Engine

## Objetivo

Processar fotos e vídeos clínicos para gerar dados objetivos de postura e movimento.

## Pipeline

1. Receber mídia.
2. Validar tipo e qualidade.
3. Extrair frames quando for vídeo.
4. Detectar pose.
5. Salvar landmarks.
6. Calcular métricas.
7. Enviar achados para o Clinical Engine.

## Primeira implementação

MediaPipe será usado no MVP por velocidade, documentação e simplicidade.

## Motores futuros

- MoveNet
- YOLO Pose
- OpenPose

## Regra arquitetural

O restante do sistema não deve depender diretamente de MediaPipe.

Devemos criar uma interface comum para permitir trocar o motor de pose no futuro sem quebrar o produto.
