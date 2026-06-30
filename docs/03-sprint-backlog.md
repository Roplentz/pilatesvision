# PilatesVision — Backlog Executivo

## Sprint 0 — Fundação estratégica

Status: iniciado.

Entregáveis:

- missão executiva;
- arquitetura MVP;
- plano do Open Intelligence Scanner;
- backlog inicial;
- critérios de decisão técnica.

## Sprint 1 — Supabase e base clínica

Objetivo: criar a infraestrutura segura para dados clínicos.

Entregáveis:

- projeto Supabase configurado;
- tabelas iniciais;
- autenticação;
- Row Level Security;
- cadastro de pacientes;
- cadastro de profissionais;
- consentimento para imagem;
- upload de mídia.

Critérios de qualidade:

- dados privados por usuário/profissional;
- estrutura preparada para multi-clínica;
- nenhum dado clínico público;
- scripts SQL versionados no GitHub.

## Sprint 2 — Vision Engine

Objetivo: permitir entrada e processamento inicial de imagens e vídeos.

Entregáveis:

- upload de foto;
- upload de vídeo;
- padronização de arquivos;
- armazenamento no Supabase Storage;
- extração básica de frames;
- metadados de avaliação.

## Sprint 3 — Pose Engine

Objetivo: detectar landmarks corporais.

Entregáveis:

- integração MediaPipe;
- detecção de pontos anatômicos;
- visualização sobre imagem;
- salvamento dos landmarks;
- cálculo de confiabilidade.

## Sprint 4 — Movement Engine

Objetivo: gerar métricas biomecânicas simples.

Entregáveis:

- cálculo de ângulos articulares;
- assimetria frontal;
- análise lateral;
- amplitude de movimento;
- gráficos simples;
- comparação entre sessões.

## Sprint 5 — Clinical Engine

Objetivo: transformar métricas em achados clínicos úteis.

Entregáveis:

- regras clínicas iniciais;
- classificação de achados;
- campos de validação profissional;
- hipóteses fisioterapêuticas;
- alertas de limitação e compensação.

## Sprint 6 — Exercícios de Pilates

Objetivo: conectar análise de movimento à prática clínica do Pilates.

Entregáveis:

- biblioteca de exercícios;
- upload de vídeo por exercício;
- análise de execução;
- identificação de compensações;
- recomendações orientadas.

## Sprint 7 — Report Engine

Objetivo: gerar relatório evolutivo.

Entregáveis:

- resumo da avaliação;
- gráficos de evolução;
- achados clínicos;
- recomendações;
- exportação PDF;
- linguagem clara para paciente e profissional.

## Sprint 8 — Dashboard Admin

Objetivo: criar visão gerencial do uso clínico.

Entregáveis:

- número de pacientes;
- avaliações realizadas;
- evolução média;
- profissionais ativos;
- auditoria de acessos;
- indicadores de uso.

## Sprint 9 — Open Intelligence Scanner v1

Objetivo: iniciar processo sistemático de curadoria GitHub.

Entregáveis:

- lista inicial de 30 repositórios;
- matriz de pontuação;
- recomendação de componentes;
- documentação de licenças;
- backlog de integração.

## Sprint 10 — MVP clínico fechado

Objetivo: entregar primeira versão usável em clínica.

Entregáveis:

- fluxo completo paciente -> avaliação -> análise -> relatório;
- segurança básica;
- documentação;
- guia de uso;
- plano de validação clínica.

## Prioridade imediata

Próxima ação recomendada:

Executar Sprint 1.

Motivo:

Sem banco de dados, autenticação e segurança, qualquer motor de IA fica solto. Primeiro protegemos a casa. Depois colocamos os robôs para trabalhar.
