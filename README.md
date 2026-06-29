# PilatesVision SaaS

SaaS premium para clínicas de Pilates com avaliação postural, análise de movimento e relatório evolutivo.

## Stack

- **Framework:** TanStack Start v1 (React 19 + Vite 7)
- **Linguagem:** TypeScript (strict)
- **Estilização:** Tailwind CSS v4 + tokens semânticos (tema "Clinical Dark")
- **UI:** shadcn/ui (Radix), lucide-react, sonner
- **Animação:** Framer Motion
- **Roteamento:** TanStack Router (file-based em `src/routes/`)
- **Validação:** Zod
- **Gerenciador de pacotes / runtime:** Bun

## Estrutura

```
src/
  routes/            # Páginas (index, auth, nova-avaliacao, exercicios, ...)
  components/ui/     # Componentes shadcn
  lib/mockData.ts    # Dados fictícios + helpers `mockApi`
  types/models.ts    # Contratos (Clinic, Student, Assessment, ...)
  styles.css         # Design tokens OKLCH + Tailwind v4
```

## Rodando localmente

Pré-requisitos: [Bun](https://bun.sh) >= 1.1 (ou Node 20+ com npm).

```bash
bun install      # instalar dependências
bun run dev      # dev server em http://localhost:8080
bun run build    # build de produção
bun run start    # preview do build
```

## Observação

> A versão atual usa **dados mockados** (`src/lib/mockData.ts`). Nenhuma chamada
> de backend, autenticação real ou modelo de IA está ativo. Toda a UI consome
> as helpers `mockApi.*`, que serão substituídas por queries reais quando a
> integração com Lovable Cloud (Supabase) for habilitada.

## Próximos passos

- [ ] Corrigir e finalizar a página **Alunos** (lista, detalhe e formulário).
- [ ] Habilitar **Supabase Auth** (login, signup, recuperação de senha).
- [ ] Criar tabela `students` com RLS por clínica.
- [ ] Persistir **avaliações** (ficha, postural, dinâmica, prescrição).
- [ ] Persistir e versionar **relatórios** evolutivos.
- [ ] Integrar a futura **API Python** (visão computacional / análise clínica)
      para alimentar resultados posturais e de movimento.
