# PilatesVision SaaS

SaaS premium para clinicas de Pilates com avaliacao postural, analise de movimento, prescricao orientada e relatorio evolutivo.

## Estado atual

O projeto agora funciona como a camada SaaS do PilatesVision: interface premium, autenticacao, rotas internas, Supabase, alunos, avaliacoes, relatorios e painel administrativo.

O motor clinico Python do MVP anterior continua sendo a melhor base para MediaPipe, OpenCV, analise postural, analise de video, metricas por frame e relatorio tecnico.

Diretriz: Lovable/React e a camada de produto. Python/FastAPI sera a camada biomecanica. Supabase e a fonte unica de dados.

## Stack principal

- TanStack Start, React, Vite e TypeScript strict.
- Tailwind CSS v4, shadcn/ui, Radix, lucide-react e Framer Motion.
- TanStack Router para rotas.
- Zod para validacao.
- Supabase para autenticacao, banco e RLS por clinica.
- Bun para instalacao, desenvolvimento e build.

## Estrutura atual

```txt
src/
  routes/                         # Landing, auth, app autenticado, admin, avaliacoes, alunos etc.
  components/ui/                  # Componentes shadcn
  hooks/                          # Auth, profile, admin
  integrations/supabase/          # Client e tipos Supabase
  lib/                            # Stores Supabase e helpers
  types/models.ts                 # Contratos de dominio
  styles.css                      # Design tokens

docs/
  01_ROADMAP.md                       # Roadmap por fases
  02_INTEGRATION_ARCHITECTURE.md      # Arquitetura SaaS + API Python + Supabase
  03_LOVABLE_TAREFAS_CONEXOES.md      # Escopo operacional para Lovable
  04_FASTAPI_CONTRACT.md              # Contrato tecnico da API Python
  05_PYTHON_ENGINE_EXTRACTION.md      # Extracao do motor Python do MVP antigo
```

## Rodando localmente

```bash
bun install
bun run dev
bun run typecheck
bun run lint
bun run build
bun run ci
```

## Banco de dados esperado

A tipagem atual contempla clinics, profiles, students, assessments, postural_results, movement_results, prescribed_exercises, reports e user_roles.

Regra essencial: toda informacao clinica deve pertencer a uma clinica, com RLS impedindo acesso cruzado entre clinicas.

## Regra clinica e etica

O PilatesVision nao substitui avaliacao profissional. Ele gera indicadores visuais, metricas e alertas de apoio a decisao. Toda tela de resultado deve manter linguagem prudente: indicadores de apoio, sugestoes e confirmacao clinica.

## Proximos passos de execucao

1. Validar login e cadastro no Lovable.
2. Validar se cada novo usuario recebe perfil e clinica.
3. Validar CRUD de alunos e avaliacoes com Supabase.
4. Conectar resultados posturais, dinamicos, prescricoes e relatorios as tabelas reais.
5. Criar API Python/FastAPI usando o motor do MVP antigo.
6. Trocar a analise textual isolada por retorno estruturado: scores, metricas, alertas, achados e imagens/videos anotados.
7. Gerar PDF evolutivo e salvar referencia no registro de relatorio.

## Decisao arquitetural

Nao reconstruir tudo no Lovable. O Lovable deve organizar interface, fluxo, Supabase e chamadas de API. A biomecanica pesada deve ficar em Python/FastAPI.
