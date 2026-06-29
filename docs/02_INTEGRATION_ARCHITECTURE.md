# Arquitetura de Integracao — PilatesVision

## Objetivo

Unificar tres pecas:

1. **Lovable/React**: produto SaaS, telas, fluxo clinico, UX, login, dashboard, administracao e consumo de dados.
2. **Supabase**: autenticacao, banco, storage, RLS, historico clinico e multi-clinica.
3. **Python/FastAPI**: motor biomecanico com MediaPipe, OpenCV, analise de imagens, analise de videos, metricas e retorno estruturado.

## Principio central

A interface nao deve tentar fazer biomecanica pesada. Ela deve coletar dados, enviar imagem/video para a API Python e salvar o resultado estruturado no Supabase.

## Fluxo alvo

```txt
Usuario logado
  -> seleciona aluno
  -> cria avaliacao
  -> envia foto ou video
  -> frontend chama API Python
  -> API retorna metricas, score, alertas e achados
  -> frontend salva resultado no Supabase
  -> frontend mostra resultado premium
  -> profissional revisa e confirma
  -> sistema gera relatorio evolutivo
```

## Dominios principais

### Clinics

Representa o estudio/clinica. Toda informacao sensivel deve estar vinculada a uma clinica.

### Profiles

Representa o usuario autenticado e seu vinculo com a clinica.

### Students

Representa o aluno/paciente do estudio.

### Assessments

Representa uma avaliacao clinica em andamento ou finalizada.

### Postural Results

Resultado estruturado da avaliacao postural: imagens, score, achados, alertas e metricas.

### Movement Results

Resultado estruturado da avaliacao dinamica: videos, score, controle, estabilidade, simetria, amplitude e observacoes.

### Prescribed Exercises

Exercicios escolhidos para a prescricao, vinculados a uma avaliacao.

### Reports

Relatorio evolutivo versionado, com conteudo estruturado e futura exportacao em PDF.

## Regras de seguranca

- Usar RLS por clinica em todas as tabelas clinicas.
- Nao permitir leitura cruzada entre clinicas.
- Admin global pode ver painel da plataforma, mas dados clinicos devem ser tratados com criterio.
- Chaves sensiveis nunca devem ir para o frontend.
- Imagens e videos devem ir para storage com controle de acesso.

## Regras clinicas

- O sistema sempre deve dizer que os resultados sao apoio a decisao profissional.
- Nao emitir diagnostico fechado.
- Usar linguagem prudente: sugere, indica, possivel, confirmar clinicamente.
- Guardar o resultado bruto e o resultado revisado pelo profissional.

## Caminho de implementacao

### Etapa 1 — Conexao Supabase

Validar:

- login;
- cadastro;
- logout;
- perfil automatico;
- clinica automatica;
- CRUD de aluno;
- CRUD de avaliacao.

### Etapa 2 — Persistencia dos resultados

Conectar:

- avaliacao postural -> postural_results;
- avaliacao dinamica -> movement_results;
- exercicios prescritos -> prescribed_exercises;
- relatorio -> reports.

### Etapa 3 — API Python

Criar servico externo:

- POST `/health` ou GET `/health`;
- POST `/analyze/postural-image`;
- POST `/analyze/dynamic-video`;
- POST `/analyze/exercise-video`.

### Etapa 4 — UX profissional

A cada analise:

- mostrar resultado automatico;
- permitir edicao/revisao pelo profissional;
- salvar versao final;
- gerar relatorio.

## Nao fazer agora

- Nao reconstruir o app do zero.
- Nao misturar todo motor Python dentro do frontend.
- Nao criar nova arquitetura paralela.
- Nao prometer diagnostico automatico.

## Decisao executiva

O PilatesVision deve ser vendido como plataforma de apoio clinico para Pilates 5.0, nao como substituto do fisioterapeuta ou instrutor. A vantagem competitiva vem da combinacao entre UX premium, dados estruturados e motor biomecanico especializado.
