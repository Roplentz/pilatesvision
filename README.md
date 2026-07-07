# PilatesVision SaaS

SaaS premium para clínicas de Pilates com avaliação postural, análise de movimento, prescrição orientada e relatório evolutivo.

## Estado atual

O projeto agora funciona como a camada SaaS do PilatesVision: interface premium, autenticação, rotas internas, Supabase, alunos, avaliações, relatórios e painel administrativo.

O motor clínico Python do MVP anterior continua sendo a melhor base para MediaPipe, OpenCV, análise postural, análise de vídeo, métricas por frame e relatório técnico.

Diretriz: Lovable/React é a camada de produto. Python/FastAPI será a camada biomecânica. Supabase é a fonte única de dados.

## Stack principal

- TanStack Start, React, Vite e TypeScript strict.
- Tailwind CSS v4, shadcn/ui, Radix, lucide-react e Framer Motion.
- TanStack Router para rotas.
- Zod para validação.
- Supabase para autenticação, banco e RLS por clínica.
- Bun para instalação, desenvolvimento e build.

## Estrutura atual

```txt
src/
  routes/                         # Landing, auth, app autenticado, admin, avaliações, alunos etc.
  components/ui/                  # Componentes shadcn
  hooks/                          # Auth, profile, admin
  integrations/supabase/          # Client e tipos Supabase
  lib/                            # Stores Supabase e helpers
  types/models.ts                 # Contratos de domínio
  styles.css                      # Design tokens

docs/
  01_ROADMAP.md                       # Roadmap por fases
  02_INTEGRATION_ARCHITECTURE.md      # Arquitetura SaaS + API Python + Supabase
  03_LOVABLE_TAREFAS_CONEXOES.md      # Escopo operacional para Lovable
  04_FASTAPI_CONTRACT.md              # Contrato técnico da API Python
  05_PYTHON_ENGINE_EXTRACTION.md      # Extração do motor Python do MVP antigo
  clinical_decision_support/          # Catálogo de métodos, exercícios, imagens e regras de apoio à decisão
```

## Camada de suporte à decisão clínica

A pasta `docs/clinical_decision_support/` contém a primeira versão estruturada do repertório de Pilates para o PilatesVision:

- taxonomia de métodos e equipamentos;
- catálogo de exercícios em CSV;
- regras clínicas de progressão, regressão e interrupção;
- proposta de schema Supabase;
- prancha SVG com imagens esquemáticas próprias.

Essa camada deve alimentar o produto como **apoio à decisão**, nunca como prescrição automática ou diagnóstico. Toda sugestão deve exigir confirmação profissional.

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

Regra essencial: toda informação clínica deve pertencer a uma clínica, com RLS impedindo acesso cruzado entre clínicas.

O catálogo de suporte à decisão pode ser global/leitura para profissionais autenticados, enquanto prescrições, análises e relatórios de pacientes devem permanecer vinculados a `clinic_id` e protegidos por RLS.

## Regra clínica e ética

O PilatesVision não substitui avaliação profissional. Ele gera indicadores visuais, métricas e alertas de apoio à decisão. Toda tela de resultado deve manter linguagem prudente: indicadores de apoio, sugestões e confirmação clínica.

## Próximos passos de execução

1. Validar login e cadastro no Lovable.
2. Validar se cada novo usuário recebe perfil e clínica.
3. Validar CRUD de alunos e avaliações com Supabase.
4. Conectar resultados posturais, dinâmicos, prescrições e relatórios às tabelas reais.
5. Criar API Python/FastAPI usando o motor do MVP antigo.
6. Trocar a análise textual isolada por retorno estruturado: scores, métricas, alertas, achados e imagens/vídeos anotados.
7. Gerar PDF evolutivo e salvar referência no registro de relatório.
8. Importar `docs/clinical_decision_support/exercise_catalog.csv` para o Supabase.
9. Criar tela de seleção de exercício com filtros por equipamento, nível, objetivo clínico e risco.
10. Implementar saída de suporte à decisão com níveis 0 a 3: observação segura, atenção técnica, regressão recomendada e interromper/reavaliar.

## Decisão arquitetural

Não reconstruir tudo no Lovable. O Lovable deve organizar interface, fluxo, Supabase e chamadas de API. A biomecânica pesada deve ficar em Python/FastAPI.
