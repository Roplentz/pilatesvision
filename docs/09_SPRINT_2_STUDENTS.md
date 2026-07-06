# PilatesVision — Sprint 2: Pacientes/Alunos

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Sprint:** Sprint 2  
**Nome da Sprint:** Pacientes/Alunos  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo da Sprint

A Sprint 2 tem como objetivo criar a base clínica real do PilatesVision: o cadastro, listagem, edição, perfil e arquivamento de pacientes/alunos.

Ao final desta sprint, o sistema deve permitir:

**Usuário logado → clínica identificada → cadastrar paciente → listar pacientes → abrir perfil → editar dados → visualizar histórico vazio pronto para futuras avaliações.**

Sem pacientes, não existe avaliação. Sem avaliação, não existe relatório. Sem relatório, não existe venda. Simples, cruel e verdadeiro.

---

## 2. Resultado Esperado

Ao final da Sprint 2, o PilatesVision deve ter:

1. Tabela `students` criada.
2. RLS aplicada por `clinic_id`.
3. Tela de listagem de pacientes.
4. Tela de cadastro de paciente.
5. Tela de perfil do paciente.
6. Edição de dados básicos.
7. Arquivamento ou inativação de paciente.
8. Busca simples por nome.
9. Filtros por status.
10. Histórico preparado para avaliações futuras.

---

## 3. Escopo da Sprint

### Entra na Sprint 2

- Criar tabela `students`.
- Criar políticas RLS para pacientes.
- Criar tela “Pacientes”.
- Criar formulário “Novo Paciente”.
- Criar perfil do paciente.
- Editar paciente.
- Arquivar paciente.
- Buscar paciente por nome.
- Filtrar pacientes ativos, inativos e arquivados.
- Preparar área de histórico do paciente.

### Não entra na Sprint 2

- Criação de avaliações.
- Relatórios.
- Upload de imagem.
- Upload de vídeo.
- API Python.
- Prescrição de exercícios.
- Dashboard avançado.
- Análise biomecânica.
- PDF.
- IA.

Esta sprint é cadastro clínico. Nada de enfeitar o boi antes de botar ele de pé.

---

## 4. Prioridade Estratégica

A prioridade absoluta desta sprint é:

**Criar uma base confiável de pacientes vinculados corretamente à clínica do usuário.**

Todos os próximos módulos dependem disso:

- Avaliações dependem de pacientes.
- Relatórios dependem de avaliações.
- Histórico depende de pacientes.
- Evolução clínica depende do vínculo correto entre paciente, avaliação e clínica.

---

## 5. Módulos Envolvidos

### 5.1 Frontend

Responsável por:

- Tela de pacientes.
- Formulário de cadastro.
- Perfil do paciente.
- Edição.
- Busca.
- Filtros.
- Estados vazios.
- Mensagens de erro.

### 5.2 Supabase Database

Responsável por:

- Persistir pacientes.
- Relacionar pacientes à clínica.
- Garantir integridade dos dados.
- Permitir busca e listagem.

### 5.3 Segurança

Responsável por:

- RLS por clínica.
- Bloqueio de acesso cruzado.
- Garantia de que um usuário não veja pacientes de outra clínica.

---

## 6. Modelo de Dados da Sprint 2

A tabela principal desta sprint será:

```txt
students
```

No contexto do PilatesVision, usaremos o termo técnico `students`, mas na interface podemos usar:

```txt
Pacientes/Alunos
```

Isso mantém o sistema amigável para clínicas de Pilates, sem perder flexibilidade clínica.

---

## 7. Tabela `students`

### Objetivo

Representar o paciente, aluno ou cliente avaliado pela clínica.

### SQL sugerido

```sql
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  birth_date date,
  age integer,
  sex text,
  phone text,
  email text,
  main_goal text,
  main_complaint text,
  clinical_notes text,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 8. Campos da Tabela

### Campos obrigatórios

- `id`
- `clinic_id`
- `name`
- `status`
- `created_at`

### Campos recomendados

- `birth_date`
- `age`
- `sex`
- `phone`
- `email`
- `main_goal`
- `main_complaint`
- `clinical_notes`
- `created_by`
- `updated_at`

---

## 9. Status do Paciente

Usar três status iniciais:

```txt
active
inactive
archived
```

### Significado

- `active`: paciente em acompanhamento.
- `inactive`: paciente sem acompanhamento atual, mas com histórico preservado.
- `archived`: paciente ocultado da rotina, mas não excluído definitivamente.

### Regra

No MVP, evitar exclusão definitiva.

Preferir arquivamento.

Excluir paciente real com histórico clínico é igual apagar prontuário porque a gaveta ficou cheia. Péssima ideia.

---

## 10. RLS — Row Level Security

### Ativar RLS

```sql
alter table public.students enable row level security;
```

### Política de leitura

```sql
create policy "Users can read students from their clinic"
on public.students
for select
using (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de criação

```sql
create policy "Users can create students in their clinic"
on public.students
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de atualização

```sql
create policy "Users can update students from their clinic"
on public.students
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de exclusão

No MVP, evitar exclusão física.

Se for necessário permitir delete apenas futuramente:

```sql
create policy "Users can delete students from their clinic"
on public.students
for delete
using (
  clinic_id = public.current_user_clinic_id()
);
```

### Recomendação executiva

Não usar delete no MVP.

Usar:

```txt
status = archived
```

---

## 11. Tela “Pacientes”

### Objetivo

Permitir que o usuário veja rapidamente todos os pacientes da sua clínica.

### Elementos mínimos

- Título: “Pacientes”
- Botão: “Novo Paciente”
- Campo de busca por nome.
- Filtro por status.
- Lista ou tabela de pacientes.
- Estado vazio para primeira utilização.

### Colunas recomendadas

- Nome.
- Idade.
- Queixa principal.
- Objetivo.
- Status.
- Última atualização.
- Ação: abrir perfil.

### Critérios de aceite

- Usuário acessa a tela de pacientes.
- Usuário vê apenas pacientes da sua clínica.
- Usuário consegue buscar por nome.
- Usuário consegue filtrar por status.
- Usuário consegue abrir o perfil do paciente.
- Quando não houver pacientes, aparece uma mensagem amigável.

---

## 12. Estado Vazio da Tela de Pacientes

Quando a clínica ainda não tiver pacientes cadastrados, exibir:

```txt
Nenhum paciente cadastrado ainda.

Comece cadastrando seu primeiro paciente para criar avaliações e relatórios evolutivos no PilatesVision.
```

Botão:

```txt
Cadastrar primeiro paciente
```

Esse detalhe é importante. Estado vazio ruim parece erro. Estado vazio bom guia o usuário.

---

## 13. Formulário “Novo Paciente”

### Objetivo

Cadastrar um novo paciente/aluno vinculado à clínica do usuário.

### Campos obrigatórios

- Nome completo.

### Campos recomendados

- Data de nascimento.
- Idade.
- Sexo.
- Telefone.
- E-mail.
- Objetivo principal.
- Queixa principal.
- Observações clínicas.

### Campos opcionais futuros

- Profissão.
- Altura.
- Peso.
- Prática de atividade física.
- Histórico de lesões.
- Diagnóstico médico informado.
- Medicamentos.
- Restrições.
- Consentimento de imagem.

### Critérios de aceite

- Usuário consegue abrir formulário.
- Usuário consegue preencher dados.
- Sistema valida nome obrigatório.
- Sistema salva paciente no Supabase.
- `clinic_id` é preenchido automaticamente.
- `created_by` é preenchido com usuário logado.
- Após salvar, usuário é levado ao perfil do paciente ou à listagem.
- Erros são exibidos claramente.

---

## 14. Validações do Formulário

### Nome

Obrigatório.

Mensagem se vazio:

```txt
Informe o nome do paciente.
```

### E-mail

Opcional, mas se preenchido deve ter formato válido.

Mensagem se inválido:

```txt
Informe um e-mail válido ou deixe o campo em branco.
```

### Status

Valor padrão:

```txt
active
```

### Idade e data de nascimento

Para MVP, aceitar um dos dois:

- Data de nascimento.
- Idade manual.

Não travar o usuário exigindo perfeição cadastral. Clínica real tem pressa. O software precisa respirar.

---

## 15. Perfil do Paciente

### Objetivo

Ser a página central do paciente dentro do PilatesVision.

### Seções mínimas

1. Dados pessoais.
2. Objetivo principal.
3. Queixa principal.
4. Observações clínicas.
5. Status.
6. Histórico de avaliações.
7. Histórico de relatórios.

### Para Sprint 2

As áreas de avaliações e relatórios podem aparecer como vazias, com CTA para futura sprint.

Exemplo:

```txt
Nenhuma avaliação registrada ainda.

Na próxima etapa, você poderá criar avaliações posturais, dinâmicas e relatórios evolutivos para este paciente.
```

### Critérios de aceite

- Usuário abre perfil do paciente.
- Dados aparecem corretamente.
- Perfil pertence à clínica do usuário.
- Áreas de avaliação e relatório aparecem preparadas.
- Não há erro se ainda não existir avaliação.

---

## 16. Edição do Paciente

### Objetivo

Permitir corrigir ou atualizar dados do paciente.

### Campos editáveis

- Nome.
- Data de nascimento.
- Idade.
- Sexo.
- Telefone.
- E-mail.
- Objetivo principal.
- Queixa principal.
- Observações clínicas.
- Status.

### Critérios de aceite

- Usuário consegue editar dados.
- Alterações persistem no Supabase.
- `updated_at` é atualizado.
- Usuário não consegue alterar `clinic_id`.
- Usuário não edita paciente de outra clínica.

---

## 17. Arquivamento do Paciente

### Objetivo

Remover paciente da rotina ativa sem apagar histórico.

### Ação

Alterar:

```txt
status = archived
```

### Interface

Botão ou ação:

```txt
Arquivar paciente
```

### Confirmação

Antes de arquivar, mostrar:

```txt
Deseja arquivar este paciente? Ele não aparecerá na lista principal, mas seu histórico será preservado.
```

### Critérios de aceite

- Usuário consegue arquivar paciente.
- Paciente arquivado não aparece na lista padrão de ativos.
- Paciente arquivado aparece se filtro “Arquivados” estiver selecionado.
- Histórico futuro permanece preservado.

---

## 18. Busca e Filtros

### Busca

Busca simples por nome.

### Filtros

- Todos.
- Ativos.
- Inativos.
- Arquivados.

### Critérios de aceite

- Busca por parte do nome funciona.
- Filtro por status funciona.
- Busca respeita `clinic_id`.
- Filtro respeita `clinic_id`.

---

## 19. Componentes de Interface

### Componentes sugeridos

- `StudentsPage`
- `StudentForm`
- `StudentList`
- `StudentCard`
- `StudentProfile`
- `StudentStatusBadge`
- `EmptyStudentsState`

### Hooks sugeridos

- `useStudents`
- `useStudent`
- `useCreateStudent`
- `useUpdateStudent`
- `useArchiveStudent`

### Serviços sugeridos

- `studentsService`
- `getStudentsByClinic`
- `createStudent`
- `updateStudent`
- `archiveStudent`

---

## 20. Linguagem da Interface

### Usar termos amigáveis

Preferir:

```txt
Paciente/Aluno
```

ou, dependendo da tela:

```txt
Paciente
```

Evitar termos técnicos demais como:

```txt
Entity
Client Object
Record
```

Isso não é painel de banco de dados. É produto clínico.

---

## 21. Dashboard após Sprint 2

Após implementar pacientes, o dashboard inicial deve exibir:

- Total de pacientes ativos.
- Total de pacientes arquivados.
- CTA “Cadastrar novo paciente”.
- CTA “Ver pacientes”.

### Critérios de aceite

- Cards mostram dados reais.
- Dados respeitam a clínica do usuário.
- Se não houver pacientes, mostrar zero.
- Nada de mock parecendo dado real.

Mock que finge ser dado real é fofoca em formato de dashboard.

---

## 22. Segurança Obrigatória

### Regras

- Todo paciente deve ter `clinic_id`.
- `clinic_id` deve vir do perfil do usuário logado.
- Usuário não pode escolher manualmente outra clínica.
- Usuário não pode ver pacientes de outra clínica.
- Usuário não pode editar pacientes de outra clínica.
- Usuário não pode arquivar pacientes de outra clínica.

### Teste obrigatório

Criar dois usuários:

- Usuário A → Clínica Alfa.
- Usuário B → Clínica Beta.

Validar:

- Usuário A cria paciente A1.
- Usuário B cria paciente B1.
- Usuário A não vê B1.
- Usuário B não vê A1.
- Usuário A não edita B1.
- Usuário B não edita A1.

---

## 23. Estados de Erro

### Erros possíveis

- Falha ao carregar pacientes.
- Falha ao salvar paciente.
- Nome obrigatório não preenchido.
- Paciente não encontrado.
- Acesso não autorizado.
- Falha ao arquivar paciente.

### Mensagens sugeridas

```txt
Não foi possível carregar os pacientes. Tente novamente.
```

```txt
Não foi possível salvar este paciente. Verifique os dados e tente novamente.
```

```txt
Paciente não encontrado ou sem permissão de acesso.
```

---

## 24. Critérios de Aceite da Sprint

A Sprint 2 será considerada concluída quando:

1. Tabela `students` estiver criada.
2. RLS estiver ativa.
3. Usuário conseguir cadastrar paciente.
4. Paciente for salvo com `clinic_id`.
5. Usuário conseguir listar pacientes.
6. Usuário conseguir buscar paciente por nome.
7. Usuário conseguir filtrar por status.
8. Usuário conseguir abrir perfil do paciente.
9. Usuário conseguir editar paciente.
10. Usuário conseguir arquivar paciente.
11. Usuário não conseguir ver pacientes de outra clínica.
12. Dashboard mostrar contagem real de pacientes.
13. Área de histórico estiver preparada.
14. Build rodar sem erro.

---

## 25. Definition of Done da Sprint 2

Uma tarefa só será considerada pronta quando:

- Estiver implementada.
- Estiver conectada ao Supabase.
- Respeitar `clinic_id`.
- Respeitar RLS.
- Tratar erros básicos.
- Ter interface clara.
- Não quebrar autenticação.
- Não quebrar dashboard.
- Não quebrar rotas.
- Passar em build.

---

## 26. Checklist Técnico

### Supabase

- [ ] Criar tabela `students`.
- [ ] Adicionar índice para `clinic_id`.
- [ ] Adicionar índice para `name`.
- [ ] Ativar RLS.
- [ ] Criar política de leitura.
- [ ] Criar política de criação.
- [ ] Criar política de atualização.
- [ ] Evitar delete físico no MVP.
- [ ] Testar isolamento por clínica.

### Frontend

- [ ] Criar página `/students`.
- [ ] Criar botão “Novo Paciente”.
- [ ] Criar formulário de paciente.
- [ ] Criar listagem.
- [ ] Criar busca.
- [ ] Criar filtros.
- [ ] Criar perfil do paciente.
- [ ] Criar edição.
- [ ] Criar arquivamento.
- [ ] Criar estado vazio.
- [ ] Atualizar dashboard com contagem real.

### Qualidade

- [ ] Testar cadastro.
- [ ] Testar listagem.
- [ ] Testar perfil.
- [ ] Testar edição.
- [ ] Testar arquivamento.
- [ ] Testar busca.
- [ ] Testar filtros.
- [ ] Testar RLS com dois usuários.
- [ ] Rodar lint.
- [ ] Rodar typecheck.
- [ ] Rodar build.

---

## 27. Comando de Validação Local

Rodar:

```bash
bun run lint
bun run typecheck
bun run build
bun run ci
```

A Sprint 2 não termina com build quebrado.

---

## 28. Prompt para Lovable — Sprint 2

Use este prompt para execução controlada:

```txt
Estamos executando a Sprint 2 do PilatesVision MVP 1.0: Pacientes/Alunos.

Objetivo:
Implementar o módulo de pacientes/alunos conectado ao Supabase, com segurança por clínica.

Escopo:
1. Criar ou ajustar a tabela students no Supabase.
2. Garantir que todo student tenha clinic_id.
3. Aplicar RLS para que cada usuário veja apenas pacientes da sua clínica.
4. Criar página Pacientes.
5. Criar listagem de pacientes.
6. Criar formulário Novo Paciente.
7. Criar perfil do paciente.
8. Permitir edição dos dados básicos.
9. Permitir arquivamento usando status = archived.
10. Criar busca por nome.
11. Criar filtros por status: todos, ativos, inativos e arquivados.
12. Atualizar dashboard com contagem real de pacientes da clínica.
13. Preparar área vazia de histórico de avaliações e relatórios no perfil do paciente.

Campos mínimos:
- name
- birth_date ou age
- sex
- phone
- email
- main_goal
- main_complaint
- clinical_notes
- status
- clinic_id
- created_by

Regras:
- Não implementar avaliações nesta etapa.
- Não implementar relatórios nesta etapa.
- Não implementar upload de imagem ou vídeo.
- Não implementar API Python.
- Não implementar IA.
- Não reconstruir o app do zero.
- Não alterar a arquitetura geral.
- Manter o menu MVP: Dashboard, Pacientes, Avaliações, Relatórios e Configurações.
- Manter TypeScript strict.
- Garantir build sem erro.

Critérios de aceite:
- Usuário cria paciente.
- Paciente aparece na lista.
- Usuário abre perfil do paciente.
- Usuário edita paciente.
- Usuário arquiva paciente.
- Busca por nome funciona.
- Filtros por status funcionam.
- Dashboard mostra total real de pacientes.
- Usuário não vê pacientes de outra clínica.
- Build sem erro.
```

---

## 29. Prompt para Lovable — Correção de Pacientes

Usar apenas se o módulo de pacientes ficar com erro:

```txt
Revise apenas o módulo de Pacientes/Alunos do PilatesVision.

Objetivo:
Corrigir problemas de cadastro, listagem, edição, arquivamento ou segurança dos pacientes.

Não implemente novas funcionalidades fora de pacientes.
Não implemente avaliações.
Não implemente relatórios.
Não implemente IA.
Não altere o design global.
Não altere a arquitetura geral.

Verifique:
1. Se a tabela students está correta.
2. Se todo student recebe clinic_id.
3. Se a RLS impede acesso cruzado entre clínicas.
4. Se a listagem carrega apenas pacientes da clínica do usuário.
5. Se o formulário salva corretamente.
6. Se a edição persiste.
7. Se o arquivamento muda status para archived.
8. Se a busca e os filtros funcionam.
9. Se o build está funcionando.

Corrija apenas o necessário.
```

---

## 30. Riscos da Sprint

### Risco 1 — Paciente sem `clinic_id`

**Impacto:** dado órfão e inseguro.  
**Prevenção:** preencher `clinic_id` automaticamente pelo perfil do usuário.

### Risco 2 — RLS bloqueando listagem

**Impacto:** usuário cadastra, mas não vê paciente.  
**Prevenção:** testar policies de insert e select.

### Risco 3 — RLS permissiva

**Impacto:** vazamento entre clínicas.  
**Prevenção:** teste obrigatório com dois usuários.

### Risco 4 — Formulário grande demais

**Impacto:** usuário desiste do cadastro.  
**Prevenção:** nome obrigatório, demais campos opcionais.

### Risco 5 — Excluir paciente por acidente

**Impacto:** perda de histórico clínico.  
**Prevenção:** arquivar, não deletar.

---

## 31. Teste Manual Obrigatório

### Teste 1 — Cadastro simples

1. Login com usuário A.
2. Acessar Pacientes.
3. Criar paciente “Maria Teste”.
4. Confirmar se aparece na lista.
5. Abrir perfil.

### Teste 2 — Edição

1. Abrir perfil de “Maria Teste”.
2. Alterar queixa principal.
3. Salvar.
4. Recarregar página.
5. Confirmar alteração.

### Teste 3 — Arquivamento

1. Arquivar “Maria Teste”.
2. Confirmar que saiu da lista de ativos.
3. Ativar filtro “Arquivados”.
4. Confirmar que aparece.

### Teste 4 — Segurança

1. Usuário A cria “Paciente Alfa”.
2. Usuário B cria “Paciente Beta”.
3. Usuário A não vê “Paciente Beta”.
4. Usuário B não vê “Paciente Alfa”.

---

## 32. Entrega Final da Sprint 2

A entrega final esperada é:

**Um módulo funcional de pacientes/alunos, seguro por clínica, preparado para receber avaliações e relatórios nas próximas sprints.**

Ao terminar esta sprint, o PilatesVision estará pronto para a Sprint 3:

**Avaliações Clínicas.**

---

## 33. Decisão Executiva

A Sprint 2 não deve criar avaliação ainda.

Ela deve garantir que o cadastro do paciente seja simples, seguro e útil.

O produto começa a ficar real quando existe um paciente cadastrado.

---

## 34. Frase de Foco da Sprint

**Sem paciente bem cadastrado, todo relatório nasce sem dono.**

Essa é a regra.
