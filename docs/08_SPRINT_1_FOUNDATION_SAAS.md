# PilatesVision — Sprint 1: Fundação SaaS

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Sprint:** Sprint 1  
**Nome da Sprint:** Fundação SaaS  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo da Sprint

A Sprint 1 tem como objetivo construir a base mínima segura do PilatesVision como SaaS clínico.

Ao final desta sprint, o sistema deve permitir:

**Usuário cria conta → faz login → é vinculado a uma clínica → acessa rotas protegidas → seus dados ficam separados por clínica.**

Sem isso, não existe SaaS. Existe maquete com Wi-Fi.

---

## 2. Resultado Esperado

Ao final da Sprint 1, o PilatesVision deve ter:

1. Autenticação funcionando.
2. Cadastro de usuário funcionando.
3. Login e logout funcionando.
4. Rotas internas protegidas.
5. Tabela de clínicas criada.
6. Tabela de perfis criada.
7. Usuário vinculado a uma clínica.
8. Row Level Security inicial configurado.
9. Estrutura pronta para pacientes, avaliações e relatórios.
10. Nenhuma rota essencial quebrada.

---

## 3. Escopo da Sprint

Esta sprint inclui apenas a fundação do SaaS.

### Entra na Sprint 1

- Supabase Auth.
- Login.
- Cadastro.
- Logout.
- Perfil do usuário.
- Clínica.
- Vínculo usuário-clínica.
- Rotas protegidas.
- RLS inicial.
- Ajuste do menu para MVP.
- Validação básica do fluxo.

### Não entra na Sprint 1

- Cadastro completo de pacientes.
- Avaliações clínicas.
- Relatórios.
- Upload de imagem.
- Upload de vídeo.
- API Python.
- PDF.
- Dashboard avançado.
- Inteligência artificial.
- Prescrição de exercícios.
- Motion AI.

Essas funções vêm depois. Agora é alicerce. Ninguém coloca lustre antes de levantar a parede.

---

## 4. Prioridade Estratégica

A prioridade absoluta desta sprint é:

**Garantir que cada usuário esteja corretamente autenticado e isolado dentro da sua clínica.**

Isso é o coração da arquitetura multi-clínica.

Se errarmos aqui, o resto do sistema nasce torto.

---

## 5. Módulos Envolvidos

### 5.1 Frontend

Responsável por:

- Tela de login.
- Tela de cadastro.
- Layout autenticado.
- Proteção de rotas.
- Redirecionamentos.
- Exibição de dados básicos do usuário e da clínica.

### 5.2 Supabase Auth

Responsável por:

- Criação de conta.
- Login.
- Sessão.
- Logout.
- Identificação do usuário autenticado.

### 5.3 Supabase Database

Responsável por:

- Persistir clínicas.
- Persistir perfis.
- Relacionar usuário com clínica.
- Aplicar regras de acesso.

### 5.4 Segurança

Responsável por:

- RLS.
- Isolamento por clínica.
- Proteção de dados.
- Bloqueio de acesso indevido.

---

## 6. Modelo de Dados da Sprint 1

Nesta sprint, criaremos ou validaremos duas tabelas principais:

1. `clinics`
2. `profiles`

---

## 7. Tabela `clinics`

### Objetivo

Representar a clínica, estúdio ou consultório que utilizará o PilatesVision.

### Campos mínimos

```sql
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text,
  phone text,
  city text,
  state text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Campos obrigatórios

- `id`
- `name`
- `owner_id`
- `created_at`

### Critérios de aceite

- Uma clínica pode ser criada.
- Cada clínica tem um proprietário.
- A clínica pertence a um usuário autenticado.
- Dados futuros do sistema poderão usar `clinic_id`.

---

## 8. Tabela `profiles`

### Objetivo

Representar o perfil do usuário dentro do PilatesVision.

### Campos mínimos

```sql
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Papéis iniciais

No MVP, usar apenas:

- `owner`
- `professional`
- `admin`

### Para Sprint 1

Usar inicialmente:

```txt
owner
```

Não complicar com equipe ainda.

### Critérios de aceite

- Cada usuário autenticado possui um perfil.
- O perfil tem `user_id`.
- O perfil pode ter `clinic_id`.
- O sistema consegue identificar a clínica do usuário logado.
- Um usuário não pode ver perfil de outra clínica.

---

## 9. Fluxo de Cadastro

### Fluxo ideal

1. Usuário acessa tela de cadastro.
2. Insere nome, e-mail, senha e nome da clínica.
3. Supabase cria usuário.
4. Sistema cria clínica.
5. Sistema cria perfil.
6. Perfil é vinculado à clínica.
7. Usuário é redirecionado para dashboard.

### Campos da tela de cadastro

- Nome completo.
- E-mail.
- Senha.
- Nome da clínica.
- Cidade.
- Estado.

### Critérios de aceite

- Cadastro cria usuário no Auth.
- Cadastro cria registro em `clinics`.
- Cadastro cria registro em `profiles`.
- Perfil recebe `clinic_id`.
- Usuário entra no dashboard após cadastro.
- Erros são exibidos de forma clara.

---

## 10. Fluxo de Login

### Fluxo

1. Usuário acessa login.
2. Insere e-mail e senha.
3. Supabase valida credenciais.
4. Sistema busca perfil.
5. Sistema identifica clínica.
6. Usuário acessa dashboard.

### Critérios de aceite

- Login funciona com usuário existente.
- Login falha com senha incorreta.
- Usuário sem sessão é redirecionado para login.
- Usuário com sessão acessa dashboard.
- Sessão persiste ao recarregar a página.

---

## 11. Fluxo de Logout

### Fluxo

1. Usuário clica em sair.
2. Supabase encerra sessão.
3. Sistema limpa estado local.
4. Usuário é redirecionado para login.

### Critérios de aceite

- Logout encerra sessão.
- Usuário não acessa rotas internas após logout.
- Redirecionamento funciona.

---

## 12. Rotas Protegidas

### Rotas públicas

- `/`
- `/login`
- `/signup`

### Rotas protegidas

- `/app`
- `/dashboard`
- `/students`
- `/assessments`
- `/reports`
- `/settings`
- `/admin`

### Regra

Toda rota protegida deve verificar:

1. Existe usuário autenticado?
2. Existe perfil?
3. Existe clínica vinculada?

Se não houver usuário autenticado:

```txt
Redirecionar para login.
```

Se houver usuário, mas não houver clínica:

```txt
Redirecionar para onboarding da clínica.
```

---

## 13. Onboarding de Clínica

### Objetivo

Garantir que todo usuário tenha clínica antes de acessar o sistema.

### Tela mínima

Campos:

- Nome da clínica.
- Cidade.
- Estado.
- Telefone opcional.
- Logo opcional.

### Critérios de aceite

- Usuário sem clínica é levado ao onboarding.
- Usuário cria clínica.
- Perfil é atualizado com `clinic_id`.
- Usuário segue para dashboard.

---

## 14. RLS — Row Level Security

### Objetivo

Impedir acesso cruzado entre clínicas.

### Regra central

Um usuário só pode acessar dados da clínica vinculada ao seu perfil.

---

## 15. RLS para `clinics`

### Ativar RLS

```sql
alter table public.clinics enable row level security;
```

### Política de leitura

```sql
create policy "Users can read their own clinic"
on public.clinics
for select
using (
  id in (
    select clinic_id
    from public.profiles
    where user_id = auth.uid()
  )
);
```

### Política de criação

```sql
create policy "Users can create their own clinic"
on public.clinics
for insert
with check (
  owner_id = auth.uid()
);
```

### Política de atualização

```sql
create policy "Clinic owners can update their clinic"
on public.clinics
for update
using (
  owner_id = auth.uid()
);
```

---

## 16. RLS para `profiles`

### Ativar RLS

```sql
alter table public.profiles enable row level security;
```

### Política de leitura

```sql
create policy "Users can read their own profile"
on public.profiles
for select
using (
  user_id = auth.uid()
);
```

### Política de criação

```sql
create policy "Users can create their own profile"
on public.profiles
for insert
with check (
  user_id = auth.uid()
);
```

### Política de atualização

```sql
create policy "Users can update their own profile"
on public.profiles
for update
using (
  user_id = auth.uid()
);
```

---

## 17. Função Auxiliar Recomendada

Criar uma função para buscar a clínica do usuário autenticado.

```sql
create or replace function public.current_user_clinic_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select clinic_id
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;
```

Essa função será útil nas próximas sprints para proteger:

- Pacientes.
- Avaliações.
- Resultados.
- Relatórios.

---

## 18. Menu MVP

Durante a Sprint 1, o menu deve ser limpo e reduzido.

### Menu recomendado

- Dashboard
- Pacientes
- Avaliações
- Relatórios
- Configurações

### Remover ou ocultar temporariamente

- Motion AI
- Digital Twin
- IA Store
- Marketplace
- Academy
- Dashboard avançado
- Prescrição inteligente
- Assistente complexo

Nada disso morreu. Só foi mandado para o banco de reservas.

---

## 19. Dashboard Inicial

### Objetivo

Exibir uma tela inicial simples após login.

### Elementos mínimos

- Saudação com nome do usuário.
- Nome da clínica.
- Cards informativos:
  - Pacientes cadastrados: em breve.
  - Avaliações: em breve.
  - Relatórios: em breve.
- CTA principal:
  - “Cadastrar primeiro paciente”
- Aviso:
  - “MVP em construção — Sprint 1: Fundação SaaS”

### Critérios de aceite

- Dashboard aparece após login.
- Nome do usuário aparece.
- Nome da clínica aparece.
- Nenhum dado falso deve parecer dado real.

---

## 20. Configurações da Clínica

### Funcionalidade mínima

Permitir visualizar e editar dados básicos da clínica.

### Campos

- Nome da clínica.
- Cidade.
- Estado.
- Telefone.
- E-mail.
- Logo opcional.

### Critérios de aceite

- Usuário consegue ver dados da clínica.
- Usuário consegue editar dados da clínica.
- Alterações persistem no Supabase.
- Usuário não edita clínica de outro usuário.

---

## 21. Estados de Erro

O sistema deve tratar erros básicos:

### Erros de autenticação

- E-mail já cadastrado.
- Senha incorreta.
- Usuário não encontrado.
- Senha fraca.
- Falha de conexão.

### Erros de clínica/perfil

- Perfil não encontrado.
- Clínica não vinculada.
- Falha ao criar clínica.
- Falha ao criar perfil.

### Mensagem padrão

Usar linguagem clara:

```txt
Não foi possível concluir esta ação. Verifique os dados e tente novamente.
```

Nada de erro alienígena tipo `undefined is not a function`. Isso assusta mais que exame de estatística.

---

## 22. Critérios de Aceite da Sprint

A Sprint 1 será considerada concluída quando:

1. Usuário conseguir criar conta.
2. Usuário conseguir fazer login.
3. Usuário conseguir sair.
4. Usuário autenticado acessar dashboard.
5. Usuário não autenticado for bloqueado.
6. Clínica for criada.
7. Perfil for criado.
8. Perfil estiver vinculado à clínica.
9. RLS estiver ativa em `clinics`.
10. RLS estiver ativa em `profiles`.
11. Usuário não conseguir acessar dados de outra clínica.
12. Menu MVP estiver limpo.
13. Dashboard inicial estiver funcional.
14. Configurações básicas da clínica estiverem acessíveis.
15. Build do projeto rodar sem erro.

---

## 23. Definition of Done da Sprint 1

Uma tarefa só será considerada pronta quando:

- Código implementado.
- Fluxo testado manualmente.
- Dados persistidos no Supabase.
- RLS aplicada quando necessário.
- Interface sem erro visual grave.
- Mensagens de erro compreensíveis.
- Nenhuma rota essencial quebrada.
- Build aprovado.
- Documentação atualizada, quando necessário.

---

## 24. Checklist Técnico

### Supabase

- [ ] Criar tabela `clinics`.
- [ ] Criar tabela `profiles`.
- [ ] Ativar RLS em `clinics`.
- [ ] Ativar RLS em `profiles`.
- [ ] Criar políticas de acesso.
- [ ] Criar função `current_user_clinic_id`.
- [ ] Testar criação de usuário.
- [ ] Testar vínculo com clínica.

### Frontend

- [ ] Revisar tela de login.
- [ ] Revisar tela de cadastro.
- [ ] Criar fluxo de onboarding da clínica.
- [ ] Criar proteção de rotas.
- [ ] Criar hook de usuário autenticado.
- [ ] Criar hook de perfil.
- [ ] Criar hook de clínica.
- [ ] Criar dashboard inicial.
- [ ] Limpar menu do MVP.
- [ ] Criar tela de configurações da clínica.

### Qualidade

- [ ] Testar login.
- [ ] Testar logout.
- [ ] Testar cadastro.
- [ ] Testar usuário sem clínica.
- [ ] Testar acesso bloqueado sem login.
- [ ] Testar RLS.
- [ ] Rodar lint.
- [ ] Rodar typecheck.
- [ ] Rodar build.

---

## 25. Comando de Validação Local

Rodar:

```bash
bun install
bun run lint
bun run typecheck
bun run build
bun run ci
```

A sprint não termina com build quebrado.

Build quebrado é como paciente dizendo “só dói quando respira”. Não dá para ignorar.

---

## 26. Prompt para Lovable — Sprint 1

Use este prompt para execução controlada no Lovable:

```txt
Estamos reorganizando o PilatesVision como um SaaS clínico para avaliação e relatórios em Pilates.

Execute apenas a Sprint 1: Fundação SaaS.

Objetivo:
Implementar autenticação, perfil de usuário, clínica, vínculo usuário-clínica, rotas protegidas e dashboard inicial.

Escopo:
1. Validar Supabase Auth com cadastro, login e logout.
2. Criar ou ajustar tabelas clinics e profiles.
3. Garantir que todo usuário tenha um profile vinculado a uma clinic.
4. Criar fluxo de onboarding para usuário sem clínica.
5. Proteger rotas internas.
6. Redirecionar usuário não autenticado para login.
7. Redirecionar usuário autenticado sem clínica para onboarding.
8. Criar dashboard inicial simples mostrando nome do usuário e nome da clínica.
9. Criar tela básica de configurações da clínica.
10. Limpar menu para manter apenas Dashboard, Pacientes, Avaliações, Relatórios e Configurações.

Regras:
- Não implementar pacientes nesta etapa.
- Não implementar avaliações nesta etapa.
- Não implementar relatórios nesta etapa.
- Não implementar IA, Motion AI, Digital Twin ou API Python.
- Não alterar a arquitetura geral.
- Não reconstruir o app do zero.
- Fazer apenas mudanças necessárias para a Sprint 1.
- Manter TypeScript strict.
- Garantir que o build continue funcionando.

Critérios de aceite:
- Usuário cria conta.
- Usuário faz login.
- Usuário faz logout.
- Usuário cria ou confirma clínica.
- Usuário acessa dashboard protegido.
- Usuário sem login não acessa rotas internas.
- Usuário sem clínica vai para onboarding.
- Dashboard mostra usuário e clínica.
- Menu MVP está limpo.
- Build sem erro.
```

---

## 27. Prompt para Lovable — Correção de RLS

Usar apenas se o problema estiver especificamente na segurança:

```txt
Revise apenas as regras de segurança do Supabase para a Sprint 1 do PilatesVision.

Objetivo:
Garantir isolamento multi-clínica usando RLS.

Tabelas envolvidas:
- clinics
- profiles

Regras:
1. Todo usuário só pode ler seu próprio profile.
2. Todo usuário só pode ler a clinic vinculada ao seu profile.
3. O owner só pode atualizar a própria clinic.
4. Usuário autenticado pode criar sua própria clinic.
5. Usuário autenticado pode criar seu próprio profile.
6. Não permitir acesso cruzado entre clínicas.

Não implemente novas telas.
Não implemente pacientes.
Não implemente avaliações.
Não implemente relatórios.
Não altere o design.
Apenas revise e corrija RLS, policies e funções auxiliares necessárias.
```

---

## 28. Riscos da Sprint

### Risco 1 — Usuário criado sem perfil

**Impacto:** quebra o fluxo interno.  
**Prevenção:** após cadastro, criar perfil imediatamente.

### Risco 2 — Usuário sem clínica

**Impacto:** dados futuros ficam órfãos.  
**Prevenção:** onboarding obrigatório.

### Risco 3 — RLS bloqueando tudo

**Impacto:** app parece quebrado.  
**Prevenção:** testar cada política com usuário real.

### Risco 4 — RLS permissiva demais

**Impacto:** vazamento de dados entre clínicas.  
**Prevenção:** testar isolamento com dois usuários.

### Risco 5 — Lovable alterar escopo

**Impacto:** bagunça o MVP.  
**Prevenção:** prompts pequenos e específicos.

---

## 29. Teste Manual Obrigatório

Criar dois usuários de teste:

### Usuário A

- Clínica: Clínica Alfa

### Usuário B

- Clínica: Clínica Beta

Validar:

- Usuário A não vê Clínica Beta.
- Usuário B não vê Clínica Alfa.
- Usuário A não altera dados de Clínica Beta.
- Usuário B não altera dados de Clínica Alfa.

Esse teste é obrigatório antes de avançar para pacientes.

---

## 30. Entrega Final da Sprint 1

A entrega final esperada é:

**Um SaaS mínimo com autenticação, clínica, perfil, rotas protegidas e isolamento inicial por clínica.**

Quando essa sprint terminar, o projeto estará pronto para a Sprint 2:

**Pacientes/Alunos.**

---

## 31. Decisão Executiva

A Sprint 1 não deve tentar impressionar visualmente.

Ela deve garantir estrutura, segurança e fluxo.

O objetivo não é fazer o app parecer grande.

O objetivo é fazer o app nascer certo.

---

## 32. Frase de Foco da Sprint

**Sem clínica, sem perfil e sem RLS, não existe SaaS clínico.**

Essa é a regra.
