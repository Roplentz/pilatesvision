# PilatesVision — Sprint 3: Avaliações Clínicas

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Sprint:** Sprint 3  
**Nome da Sprint:** Avaliações Clínicas  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo da Sprint

A Sprint 3 tem como objetivo permitir que o profissional crie, registre, edite e finalize avaliações clínicas vinculadas a um paciente/aluno.

Ao final desta sprint, o sistema deve permitir:

**Usuário logado → escolhe paciente → cria avaliação → registra dados clínicos → adiciona achados posturais, dinâmicos ou por exercício → salva rascunho → finaliza avaliação.**

Agora o PilatesVision deixa de ser apenas cadastro e começa a virar produto clínico de verdade.

---

## 2. Resultado Esperado

Ao final da Sprint 3, o PilatesVision deve ter:

1. Tabela `assessments` criada.
2. Tabela `postural_results` criada.
3. Tabela `movement_results` criada.
4. Tabela `exercise_results` criada.
5. RLS aplicada em todas as tabelas.
6. Fluxo de nova avaliação.
7. Avaliação vinculada ao paciente.
8. Avaliação vinculada à clínica.
9. Registro de achados clínicos.
10. Status da avaliação: rascunho, em revisão e finalizada.
11. Histórico de avaliações no perfil do paciente.
12. Base pronta para gerar relatórios na Sprint 4.

---

## 3. Escopo da Sprint

### Entra na Sprint 3

- Criar avaliação.
- Selecionar paciente.
- Escolher tipo de avaliação.
- Registrar dados clínicos básicos.
- Registrar avaliação postural estática.
- Registrar avaliação dinâmica simples.
- Registrar avaliação por exercício de Pilates.
- Salvar avaliação como rascunho.
- Editar avaliação.
- Finalizar avaliação.
- Mostrar avaliações no perfil do paciente.
- Aplicar RLS por clínica.

### Não entra na Sprint 3

- Geração de relatório final.
- Exportação PDF.
- API Python.
- Análise automática por IA.
- Upload avançado com processamento biomecânico.
- Prescrição automática.
- Comparação evolutiva avançada.
- Dashboard analítico.
- Motion AI.
- Digital Twin.

Esta sprint é avaliação estruturada. Nada de querer colocar IA pilotando antes de ter volante.

---

## 4. Prioridade Estratégica

A prioridade absoluta desta sprint é:

**Criar uma avaliação clínica simples, estruturada, editável e segura.**

O objetivo ainda não é impressionar com automação.

O objetivo é permitir que o profissional registre uma boa avaliação e transforme isso em relatório na próxima sprint.

---

## 5. Módulos Envolvidos

### 5.1 Frontend

Responsável por:

- Tela de nova avaliação.
- Wizard ou fluxo por etapas.
- Formulários clínicos.
- Campos de achados.
- Listagem de avaliações.
- Edição.
- Finalização.
- Estados de erro.
- Estados vazios.

### 5.2 Supabase Database

Responsável por:

- Persistir avaliações.
- Relacionar avaliação com paciente.
- Relacionar avaliação com clínica.
- Persistir achados posturais.
- Persistir achados dinâmicos.
- Persistir achados por exercício.

### 5.3 Segurança

Responsável por:

- RLS por `clinic_id`.
- Bloqueio de acesso cruzado.
- Garantia de que avaliação, paciente e clínica sejam coerentes.

---

## 6. Modelo de Dados da Sprint 3

Tabelas principais:

1. `assessments`
2. `postural_results`
3. `movement_results`
4. `exercise_results`

---

# 7. Tabela `assessments`

## Objetivo

Representar uma avaliação clínica criada para um paciente/aluno.

## SQL sugerido

```sql
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  professional_id uuid references auth.users(id) on delete set null,
  title text,
  type text not null default 'general',
  objective text,
  main_complaint text,
  pain_score integer,
  clinical_notes text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz
);
```

## Tipos de avaliação

Usar inicialmente:

```txt
postural
dynamic
exercise
complete
```

### Significado

- `postural`: avaliação postural estática.
- `dynamic`: avaliação de movimento.
- `exercise`: avaliação por exercício de Pilates.
- `complete`: avaliação combinada.

## Status da avaliação

Usar:

```txt
draft
in_review
finalized
```

### Significado

- `draft`: avaliação em rascunho.
- `in_review`: avaliação pronta para revisão.
- `finalized`: avaliação finalizada e pronta para relatório.

## Campos obrigatórios

- `id`
- `clinic_id`
- `student_id`
- `type`
- `status`
- `created_at`

## Critérios de aceite

- Avaliação é criada.
- Avaliação pertence a uma clínica.
- Avaliação pertence a um paciente.
- Avaliação registra o profissional responsável.
- Avaliação pode ser salva como rascunho.
- Avaliação pode ser finalizada.

---

# 8. Tabela `postural_results`

## Objetivo

Registrar achados da avaliação postural estática.

## SQL sugerido

```sql
create table if not exists public.postural_results (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  view text,
  image_url text,
  findings jsonb default '[]'::jsonb,
  score integer,
  professional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Vistas posturais

Usar:

```txt
anterior
posterior
right_lateral
left_lateral
```

## Achados sugeridos

- Assimetria de ombros.
- Assimetria pélvica.
- Anteriorização de cabeça.
- Alteração de alinhamento de joelhos.
- Alteração de apoio dos pés.
- Alteração de curvaturas.
- Compensações posturais observáveis.
- Alteração de distribuição de peso observada.

## Estrutura sugerida para `findings`

```json
[
  {
    "region": "Ombros",
    "finding": "Assimetria leve observada",
    "severity": "leve",
    "notes": "Confirmar clinicamente durante avaliação funcional."
  }
]
```

## Critérios de aceite

- Usuário consegue registrar achados posturais.
- Achados ficam vinculados à avaliação.
- Achados ficam vinculados ao paciente.
- Achados ficam vinculados à clínica.
- Linguagem deve ser prudente.
- Não emitir diagnóstico automático.

---

# 9. Tabela `movement_results`

## Objetivo

Registrar achados da avaliação dinâmica simples.

## SQL sugerido

```sql
create table if not exists public.movement_results (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  movement_name text not null,
  video_url text,
  compensations jsonb default '[]'::jsonb,
  score integer,
  professional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Movimentos iniciais

Começar com:

1. Agachamento.
2. Flexão de tronco.
3. Elevação de membros superiores.
4. Ponte.
5. Movimento livre.

## Compensações sugeridas

- Valgo dinâmico.
- Assimetria de descarga de peso.
- Instabilidade pélvica.
- Compensação lombar.
- Compensação cervical.
- Redução de amplitude.
- Perda de controle motor.
- Dor durante o movimento.
- Medo ou hesitação durante execução.

## Estrutura sugerida para `compensations`

```json
[
  {
    "movement": "Agachamento",
    "compensation": "Valgo dinâmico leve no joelho direito",
    "severity": "leve",
    "notes": "Observar relação com controle de quadril e pé."
  }
]
```

## Critérios de aceite

- Usuário escolhe movimento avaliado.
- Usuário registra compensações.
- Usuário salva observações.
- Resultado fica vinculado à avaliação.
- Resultado aparece no perfil do paciente.
- Não há análise automática ainda.

---

# 10. Tabela `exercise_results`

## Objetivo

Registrar observações da execução de exercícios de Pilates.

## SQL sugerido

```sql
create table if not exists public.exercise_results (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  exercise_name text not null,
  apparatus text,
  execution_notes text,
  compensations jsonb default '[]'::jsonb,
  control_level text,
  recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Exercícios iniciais

- Hundred.
- Roll Up.
- Single Leg Stretch.
- Bridge.
- Swan.
- Side Kick.
- Footwork no Reformer.
- Squat no Reformer.
- Exercício livre.

## Aparelhos iniciais

- Solo.
- Reformer.
- Cadillac.
- Chair.
- Barrel.
- Outro.

## Nível de controle

Usar:

```txt
baixo
moderado
bom
excelente
```

## Compensações sugeridas

- Tensão cervical.
- Elevação de ombros.
- Instabilidade lombopélvica.
- Perda de alinhamento de joelho.
- Redução de amplitude.
- Assimetria de movimento.
- Falta de coordenação respiratória.
- Dor durante execução.

## Critérios de aceite

- Usuário escolhe exercício.
- Usuário registra execução.
- Usuário registra compensações.
- Usuário classifica controle.
- Usuário registra recomendação.
- Resultado fica salvo na avaliação.

---

# 11. RLS — Row Level Security

## Regra central

Usuário só pode acessar avaliações e resultados da própria clínica.

---

## 11.1 RLS para `assessments`

```sql
alter table public.assessments enable row level security;
```

### Leitura

```sql
create policy "Users can read assessments from their clinic"
on public.assessments
for select
using (
  clinic_id = public.current_user_clinic_id()
);
```

### Criação

```sql
create policy "Users can create assessments in their clinic"
on public.assessments
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);
```

### Atualização

```sql
create policy "Users can update assessments from their clinic"
on public.assessments
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

---

## 11.2 RLS para `postural_results`

```sql
alter table public.postural_results enable row level security;
```

```sql
create policy "Users can read postural results from their clinic"
on public.postural_results
for select
using (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can create postural results in their clinic"
on public.postural_results
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can update postural results from their clinic"
on public.postural_results
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

---

## 11.3 RLS para `movement_results`

```sql
alter table public.movement_results enable row level security;
```

```sql
create policy "Users can read movement results from their clinic"
on public.movement_results
for select
using (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can create movement results in their clinic"
on public.movement_results
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can update movement results from their clinic"
on public.movement_results
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

---

## 11.4 RLS para `exercise_results`

```sql
alter table public.exercise_results enable row level security;
```

```sql
create policy "Users can read exercise results from their clinic"
on public.exercise_results
for select
using (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can create exercise results in their clinic"
on public.exercise_results
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);

create policy "Users can update exercise results from their clinic"
on public.exercise_results
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

---

# 12. Fluxo Principal da Avaliação

## Jornada 1 — Criar nova avaliação

1. Usuário abre perfil do paciente.
2. Clica em “Nova Avaliação”.
3. Escolhe tipo da avaliação.
4. Preenche objetivo e queixa principal.
5. Salva rascunho.
6. Sistema cria registro em `assessments`.

## Jornada 2 — Registrar achados

1. Usuário escolhe seção da avaliação.
2. Registra achados posturais, dinâmicos ou por exercício.
3. Salva dados.
4. Sistema vincula resultados à avaliação.

## Jornada 3 — Finalizar avaliação

1. Usuário revisa dados.
2. Clica em “Finalizar avaliação”.
3. Status muda para `finalized`.
4. `finalized_at` é preenchido.
5. Avaliação fica pronta para relatório.

---

# 13. Tela “Nova Avaliação”

## Elementos mínimos

- Nome do paciente.
- Data da avaliação.
- Tipo da avaliação.
- Objetivo.
- Queixa principal.
- Dor atual, se aplicável.
- Observações clínicas.
- Botão “Salvar rascunho”.
- Botão “Continuar”.

## Tipos exibidos

- Avaliação postural.
- Avaliação dinâmica.
- Exercício de Pilates.
- Avaliação completa.

## Critérios de aceite

- Usuário acessa a partir do perfil do paciente.
- Paciente já vem selecionado.
- Usuário escolhe tipo.
- Usuário salva rascunho.
- Avaliação aparece no histórico do paciente.

---

# 14. Tela de Avaliação Postural

## Elementos mínimos

- Seleção da vista:
  - Anterior.
  - Posterior.
  - Lateral direita.
  - Lateral esquerda.
- Campo de achados.
- Lista de achados sugeridos.
- Severidade:
  - leve
  - moderada
  - importante
- Observações profissionais.
- Score opcional.
- Upload opcional de imagem.

## Regra para upload

No MVP, upload é opcional.

Se estiver complexo, registrar apenas achados manuais.

Melhor avaliação manual funcionando do que upload bugado fingindo futuro.

---

# 15. Tela de Avaliação Dinâmica

## Elementos mínimos

- Movimento avaliado.
- Compensações observadas.
- Severidade.
- Dor durante movimento.
- Controle motor percebido.
- Observações profissionais.
- Score opcional.
- Upload opcional de vídeo.

## Movimentos sugeridos

- Agachamento.
- Flexão de tronco.
- Elevação de membros superiores.
- Ponte.
- Movimento livre.

---

# 16. Tela de Avaliação por Exercício

## Elementos mínimos

- Nome do exercício.
- Aparelho.
- Execução observada.
- Compensações.
- Nível de controle.
- Recomendação.
- Observações.

## Recomendações possíveis

- Manter exercício.
- Reduzir carga.
- Reduzir amplitude.
- Regredir exercício.
- Progredir exercício.
- Corrigir padrão antes de progressão.
- Suspender temporariamente se houver dor.

---

# 17. Histórico de Avaliações no Perfil do Paciente

## Elementos mínimos

No perfil do paciente, exibir:

- Data da avaliação.
- Tipo.
- Status.
- Profissional.
- Resumo curto.
- Botão “Abrir avaliação”.
- Botão futuro “Gerar relatório”.

## Estado vazio

```txt
Nenhuma avaliação registrada ainda.

Crie a primeira avaliação para iniciar o acompanhamento evolutivo deste paciente.
```

## Critérios de aceite

- Avaliações aparecem no perfil do paciente.
- Avaliações são ordenadas da mais recente para a mais antiga.
- Usuário só vê avaliações da própria clínica.
- Avaliações finalizadas ficam identificadas.

---

# 18. Linguagem Clínica

O sistema deve usar linguagem prudente.

## Usar

- “Achado observado”
- “Sugere”
- “Pode indicar”
- “Necessita confirmação clínica”
- “Compatível com”
- “Observação profissional”
- “Apoio à decisão”

## Evitar

- “Diagnóstico”
- “Detectado com certeza”
- “Correção automática”
- “Patologia confirmada”
- “Tratamento indicado obrigatoriamente”
- “IA concluiu”

O PilatesVision é copiloto. Quem pilota é o profissional.

---

# 19. Estados de Erro

## Erros possíveis

- Falha ao criar avaliação.
- Falha ao salvar achados.
- Avaliação não encontrada.
- Paciente não encontrado.
- Acesso não autorizado.
- Falha ao finalizar avaliação.
- Dados obrigatórios ausentes.

## Mensagens sugeridas

```txt
Não foi possível criar a avaliação. Verifique os dados e tente novamente.
```

```txt
Não foi possível salvar os achados desta avaliação.
```

```txt
Avaliação não encontrada ou sem permissão de acesso.
```

```txt
Preencha os dados obrigatórios antes de finalizar.
```

---

# 20. Critérios de Aceite da Sprint

A Sprint 3 será considerada concluída quando:

1. Usuário conseguir criar avaliação para um paciente.
2. Avaliação for salva com `clinic_id`.
3. Avaliação for salva com `student_id`.
4. Avaliação aparecer no perfil do paciente.
5. Usuário conseguir registrar achados posturais.
6. Usuário conseguir registrar achados dinâmicos.
7. Usuário conseguir registrar achados por exercício.
8. Usuário conseguir salvar rascunho.
9. Usuário conseguir editar avaliação.
10. Usuário conseguir finalizar avaliação.
11. RLS impedir acesso cruzado.
12. Avaliação finalizada ficar pronta para relatório.
13. Build rodar sem erro.

---

# 21. Definition of Done da Sprint 3

Uma tarefa só será considerada pronta quando:

- Estiver implementada.
- Estiver conectada ao Supabase.
- Respeitar `clinic_id`.
- Respeitar `student_id`.
- Respeitar RLS.
- Tiver tratamento básico de erro.
- Tiver linguagem clínica prudente.
- Não emitir diagnóstico automático.
- Não quebrar pacientes.
- Não quebrar autenticação.
- Passar em build.

---

# 22. Checklist Técnico

## Supabase

- [ ] Criar tabela `assessments`.
- [ ] Criar tabela `postural_results`.
- [ ] Criar tabela `movement_results`.
- [ ] Criar tabela `exercise_results`.
- [ ] Adicionar índices para `clinic_id`.
- [ ] Adicionar índices para `student_id`.
- [ ] Adicionar índices para `assessment_id`.
- [ ] Ativar RLS em todas as tabelas.
- [ ] Criar políticas de leitura.
- [ ] Criar políticas de criação.
- [ ] Criar políticas de atualização.
- [ ] Testar isolamento por clínica.

## Frontend

- [ ] Criar página ou rota de nova avaliação.
- [ ] Criar formulário inicial da avaliação.
- [ ] Criar fluxo de seleção do tipo.
- [ ] Criar tela de avaliação postural.
- [ ] Criar tela de avaliação dinâmica.
- [ ] Criar tela de avaliação por exercício.
- [ ] Criar listagem de avaliações no perfil do paciente.
- [ ] Criar ação de salvar rascunho.
- [ ] Criar ação de finalizar avaliação.
- [ ] Criar edição de avaliação.
- [ ] Preparar botão futuro “Gerar relatório”.

## Qualidade

- [ ] Testar criação de avaliação.
- [ ] Testar rascunho.
- [ ] Testar edição.
- [ ] Testar finalização.
- [ ] Testar avaliação postural.
- [ ] Testar avaliação dinâmica.
- [ ] Testar avaliação por exercício.
- [ ] Testar RLS com dois usuários.
- [ ] Rodar lint.
- [ ] Rodar typecheck.
- [ ] Rodar build.

---

# 23. Comando de Validação Local

Rodar:

```bash
bun run lint
bun run typecheck
bun run build
bun run ci
```

Sprint 3 com build quebrado não finaliza. Código quebrado é avaliação com goniômetro de borracha.

---

# 24. Prompt para Lovable — Sprint 3

Use este prompt para execução controlada:

```txt
Estamos executando a Sprint 3 do PilatesVision MVP 1.0: Avaliações Clínicas.

Objetivo:
Implementar o módulo de avaliações clínicas estruturadas, conectado ao Supabase e seguro por clínica.

Escopo:
1. Criar ou ajustar a tabela assessments.
2. Criar ou ajustar as tabelas postural_results, movement_results e exercise_results.
3. Garantir que toda avaliação tenha clinic_id e student_id.
4. Aplicar RLS para impedir acesso cruzado entre clínicas.
5. Criar fluxo “Nova Avaliação” a partir do perfil do paciente.
6. Permitir escolher tipo de avaliação: postural, dynamic, exercise ou complete.
7. Criar formulário inicial com objetivo, queixa principal, dor atual e observações clínicas.
8. Permitir salvar avaliação como draft.
9. Criar seção de avaliação postural com achados manuais e vista avaliada.
10. Criar seção de avaliação dinâmica com movimento avaliado e compensações.
11. Criar seção de avaliação por exercício com exercício, aparelho, controle, compensações e recomendação.
12. Permitir editar avaliação.
13. Permitir finalizar avaliação, mudando status para finalized e preenchendo finalized_at.
14. Mostrar avaliações no perfil do paciente.
15. Preparar botão futuro “Gerar relatório”, sem implementar relatório ainda.

Regras:
- Não implementar relatório nesta etapa.
- Não implementar PDF nesta etapa.
- Não implementar API Python nesta etapa.
- Não implementar IA.
- Não implementar Motion AI.
- Não implementar Digital Twin.
- Não reconstruir o app do zero.
- Não alterar a arquitetura geral.
- Manter TypeScript strict.
- Garantir build sem erro.
- Usar linguagem clínica prudente.
- Não emitir diagnóstico automático.

Critérios de aceite:
- Usuário cria avaliação para paciente.
- Avaliação aparece no perfil do paciente.
- Usuário salva rascunho.
- Usuário registra achados posturais.
- Usuário registra achados dinâmicos.
- Usuário registra achados por exercício.
- Usuário edita avaliação.
- Usuário finaliza avaliação.
- Usuário não vê avaliações de outra clínica.
- Build sem erro.
```

---

# 25. Prompt para Lovable — Correção de Avaliações

Usar apenas se o módulo de avaliações ficar com erro:

```txt
Revise apenas o módulo de Avaliações Clínicas do PilatesVision.

Objetivo:
Corrigir problemas de criação, edição, finalização, histórico ou segurança das avaliações.

Não implemente relatórios.
Não implemente PDF.
Não implemente API Python.
Não implemente IA.
Não altere o design global.
Não altere a arquitetura geral.
Não mexa no módulo de pacientes além do necessário para vincular avaliações.

Verifique:
1. Se assessments está correta.
2. Se postural_results está correta.
3. Se movement_results está correta.
4. Se exercise_results está correta.
5. Se toda avaliação recebe clinic_id.
6. Se toda avaliação recebe student_id.
7. Se a RLS impede acesso cruzado.
8. Se o fluxo Nova Avaliação funciona a partir do perfil do paciente.
9. Se salvar rascunho funciona.
10. Se editar avaliação funciona.
11. Se finalizar avaliação funciona.
12. Se as avaliações aparecem no perfil do paciente.
13. Se o build está funcionando.

Corrija apenas o necessário.
```

---

# 26. Riscos da Sprint

## Risco 1 — Avaliação sem paciente

**Impacto:** avaliação órfã.  
**Prevenção:** sempre criar avaliação a partir do perfil do paciente ou exigir `student_id`.

## Risco 2 — Avaliação sem clínica

**Impacto:** falha de segurança.  
**Prevenção:** `clinic_id` sempre vem do usuário logado.

## Risco 3 — Escopo virar relatório

**Impacto:** Sprint 3 incha e atrasa.  
**Prevenção:** botão “Gerar relatório” apenas preparado, sem implementar.

## Risco 4 — Upload atrasar avaliação

**Impacto:** o essencial fica preso no acessório.  
**Prevenção:** upload opcional; achados manuais primeiro.

## Risco 5 — Linguagem diagnóstica

**Impacto:** risco clínico e regulatório.  
**Prevenção:** usar linguagem prudente e revisão profissional.

---

# 27. Teste Manual Obrigatório

## Teste 1 — Criar avaliação

1. Login com usuário A.
2. Abrir paciente “Maria Teste”.
3. Clicar em “Nova Avaliação”.
4. Escolher “Avaliação completa”.
5. Preencher objetivo e queixa.
6. Salvar rascunho.
7. Confirmar se aparece no perfil.

## Teste 2 — Registrar achados posturais

1. Abrir avaliação.
2. Adicionar vista anterior.
3. Inserir achado de assimetria de ombros leve.
4. Salvar.
5. Recarregar página.
6. Confirmar persistência.

## Teste 3 — Registrar avaliação dinâmica

1. Abrir avaliação.
2. Selecionar movimento “Agachamento”.
3. Inserir compensação observada.
4. Salvar.
5. Confirmar persistência.

## Teste 4 — Registrar exercício

1. Abrir avaliação.
2. Selecionar exercício “Bridge”.
3. Registrar controle moderado.
4. Inserir recomendação.
5. Salvar.

## Teste 5 — Finalizar avaliação

1. Abrir avaliação em rascunho.
2. Clicar em finalizar.
3. Confirmar mudança para `finalized`.
4. Confirmar preenchimento de `finalized_at`.

## Teste 6 — Segurança

1. Usuário A cria avaliação no paciente A.
2. Usuário B cria avaliação no paciente B.
3. Usuário A não vê avaliação de B.
4. Usuário B não vê avaliação de A.

---

# 28. Entrega Final da Sprint 3

A entrega final esperada é:

**Um módulo funcional de avaliações clínicas, seguro por clínica, vinculado aos pacientes e pronto para alimentar relatórios premium.**

Ao terminar esta sprint, o PilatesVision estará pronto para a Sprint 4:

**Relatórios Evolutivos.**

---

# 29. Decisão Executiva

A Sprint 3 deve priorizar estrutura clínica, não automação.

A automação virá depois.

Primeiro, precisamos garantir que o profissional consiga registrar uma boa avaliação de forma simples, segura e reutilizável.

---

# 30. Frase de Foco da Sprint

**Avaliação boa é aquela que vira relatório bom.**

Essa é a regra.
