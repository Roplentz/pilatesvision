# Roadmap — PilatesVision SaaS

## Fase 1 — App navegavel com dados mockados

Objetivo: transformar a interface atual em um SaaS clicavel e demonstravel.

Checklist:

- [ ] Landing page publica
- [ ] Dashboard interno
- [ ] Pagina Alunos
- [ ] Nova Avaliacao
- [ ] Avaliacao Postural
- [ ] Avaliacao Dinamica
- [ ] Exercicios Pilates
- [ ] Relatorios
- [ ] Configuracoes
- [ ] Nome PilatesVision em todo o app
- [ ] Nenhuma rota quebrada

## Fase 2 — Autenticacao minima

Objetivo: permitir acesso com email e senha.

Checklist:

- [ ] Supabase Auth
- [ ] Login
- [ ] Cadastro
- [ ] Logout
- [ ] Protecao das paginas internas
- [ ] Redirecionamento de usuario nao logado para Login

## Fase 3 — Alunos reais

Objetivo: substituir dados mockados de alunos por dados Supabase.

Checklist:

- [ ] Tabela students
- [ ] Criar aluno
- [ ] Listar alunos
- [ ] Editar aluno
- [ ] Excluir aluno
- [ ] RLS por clinica

## Fase 4 — Avaliacoes

Objetivo: salvar avaliacoes estruturadas.

Checklist:

- [ ] Tabela assessments
- [ ] Resultados posturais mockados salvos
- [ ] Resultados dinamicos mockados salvos
- [ ] Exercicios prescritos

## Fase 5 — Relatorios

Objetivo: gerar e salvar relatorios evolutivos.

Checklist:

- [ ] Tabela reports
- [ ] Visualizacao premium
- [ ] Exportacao PDF futura
- [ ] Historico evolutivo

## Fase 6 — API Python

Objetivo: conectar a camada SaaS ao motor tecnico.

Checklist:

- [ ] FastAPI ou servico Python
- [ ] Endpoint para imagem postural
- [ ] Endpoint para video dinamico
- [ ] Retorno de metricas estruturadas
- [ ] Salvamento no Supabase

## Regra de ouro

Cada prompt no Lovable deve fazer uma unica coisa.

Nao pedir:

- refaca tudo;
- conecte tudo;
- implemente toda a IA;
- melhore o app inteiro.

Pedir sempre com escopo limitado.
