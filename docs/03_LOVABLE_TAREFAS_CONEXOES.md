# Tarefas para finalizar conexoes no Lovable

Este documento lista o escopo que deve ser executado no Lovable para deixar o PilatesVision rodando com Supabase e pronto para conectar a API Python.

## Escopo

Preservar a arquitetura atual, a identidade visual e as rotas existentes. A tarefa e conectar o que falta, nao reconstruir o app.

## 1. Autenticacao e perfil

- Validar login, cadastro e logout.
- Redirecionar usuario logado para dashboard.
- Redirecionar usuario sem sessao para auth.
- Garantir profile para usuario novo.
- Garantir clinica inicial para usuario comum sem clinic_id.
- Permitir admin global em admin.
- Bloquear admin para usuario comum.

## 2. Alunos

- Listar alunos por clinic_id.
- Criar aluno.
- Abrir detalhe do aluno.
- Listar avaliacoes vinculadas ao aluno.
- Exibir loading, erro e estado vazio.

## 3. Avaliacoes

- Criar avaliacao com student_id e clinic_id.
- Listar avaliacoes por clinica.
- Abrir detalhe de avaliacao.
- Atualizar current_stage conforme fluxo.
- Salvar queixa, dor, objetivos e observacoes.

## 4. Resultado postural

- Enviar imagem por vista: anterior, lateral e posterior.
- Usar endpoint interno atual de analise de imagem como fallback.
- Preparar integracao futura com API Python para analise postural.
- Salvar score, findings, imagens e assessment_id em postural_results.
- Mostrar aviso de apoio a decisao profissional.

## 5. Resultado dinamico

- Selecionar movimento.
- Usar fallback por imagem/frame enquanto video completo nao estiver ativo.
- Preparar integracao futura com API Python para video.
- Salvar controle, estabilidade, simetria, amplitude, movimento avaliado e video_url em movement_results.

## 6. Exercicios prescritos

- Salvar exercicio em prescribed_exercises quando houver avaliacao ativa.
- Se nao houver avaliacao ativa, mostrar aviso para criar ou selecionar avaliacao.
- Salvar assessment_id, name, level, focus, series e order_index.
- Mostrar exercicios prescritos no detalhe da avaliacao.

## 7. Relatorios

- Gerar relatorio com aluno, avaliacao, resultado postural, dinamico e exercicios.
- Salvar em reports com assessment_id, clinic_id, student_id, content e version.
- Exibir relatorios anteriores.
- Deixar pdf_url reservado para exportacao futura.

## 8. Cliente da API Python

Criar um cliente em `src/lib/pilatesVisionApi.ts` com funcoes:

- analyzePosturalImage
- analyzeDynamicVideo
- analyzeExerciseVideo

Regras:

- Quando a API externa nao estiver configurada, usar fallback interno para imagem.
- Retornar JSON padronizado para as telas.
- Tratar erros com mensagens amigaveis.
- Nunca deixar a tela travada sem feedback.

## Resultado esperado para hoje

Fluxo minimo funcionando:

1. criar conta;
2. entrar;
3. abrir dashboard;
4. cadastrar aluno;
5. criar avaliacao;
6. enviar imagem postural;
7. receber analise;
8. salvar resultado;
9. prescrever exercicios;
10. gerar relatorio salvo.

## Nao fazer

- Nao mudar identidade visual.
- Nao remover rotas existentes.
- Nao recriar app do zero.
- Nao implementar biomecanica pesada no frontend.
- Nao apagar mocks sem fallback seguro.
- Nao prometer diagnostico automatico.
