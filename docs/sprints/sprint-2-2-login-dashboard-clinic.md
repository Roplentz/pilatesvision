# Sprint 2.2 — Login, Dashboard e Cadastro de Clínica

## Objetivo

Permitir que o fisioterapeuta entre no PilatesVision, crie sua clínica e acesse um dashboard inicial com orientação clara para o próximo passo do MVP.

## Escopo

### Incluído

- Login com Supabase Auth.
- Cadastro inicial da clínica.
- Associação da clínica ao usuário autenticado.
- Dashboard inicial da clínica.
- Estado de onboarding.
- Cards de próximos passos.

### Fora do escopo

- Cadastro completo de pacientes.
- Upload de imagem.
- Processamento MediaPipe.
- Relatório PDF.
- Agenda completa.

## Fluxo do usuário

```text
Usuário acessa PilatesVision
↓
Login / cadastro
↓
Sistema verifica se existe clínica vinculada
↓
Se não existir: tela de criação de clínica
↓
Se existir: dashboard
↓
Dashboard orienta próximos passos
```

## Rotas recomendadas

```text
/login
/onboarding/clinic
/dashboard
/settings/clinic
```

## Componentes necessários

### Auth

- LoginForm
- RegisterForm
- AuthGuard
- LogoutButton

### Clinic

- ClinicOnboardingForm
- ClinicProfileCard
- ClinicSettingsForm

### Dashboard

- DashboardShell
- WelcomeHeader
- QuickStats
- NextStepCards
- RecentActivity
- EmptyState

## Dados mínimos para criar clínica

Tabela: `clinics`

Campos obrigatórios no MVP:

- name
- owner_user_id

Campos opcionais:

- cnpj
- email
- phone
- address
- logo_url

## Regras de negócio

1. Todo usuário autenticado deve ter pelo menos uma clínica para usar o sistema.
2. No MVP, o primeiro usuário que cria a clínica é o proprietário.
3. O dashboard só abre se houver clínica vinculada.
4. Dados clínicos devem sempre ser filtrados por `clinic_id`.
5. Se o usuário perder acesso à clínica, deve ser redirecionado para onboarding ou erro de permissão.

## Dashboard MVP

### Cards principais

- Pacientes cadastrados
- Avaliações realizadas
- Relatórios emitidos
- Próxima ação recomendada

### Próximos passos

1. Completar dados da clínica.
2. Cadastrar primeiro paciente.
3. Realizar primeira avaliação postural.
4. Gerar primeiro relatório.

## Estados da interface

### Sem clínica

Mostrar tela de onboarding.

### Clínica criada, sem pacientes

Mostrar dashboard com CTA: cadastrar primeiro paciente.

### Clínica com pacientes, sem avaliações

Mostrar CTA: iniciar avaliação.

### Clínica com avaliações

Mostrar últimas avaliações e indicadores.

## Integração Supabase

### Consultar clínica do usuário

```sql
select * from clinics
where owner_user_id = auth.uid()
limit 1;
```

### Criar clínica

```sql
insert into clinics (name, cnpj, email, phone, address, owner_user_id)
values (..., auth.uid());
```

## Critérios de aceite

- [ ] Usuário consegue fazer login.
- [ ] Usuário sem clínica é redirecionado para onboarding.
- [ ] Usuário consegue criar clínica.
- [ ] Clínica criada aparece no dashboard.
- [ ] Dashboard mostra cards vazios e próximos passos.
- [ ] Fluxo respeita RLS.
- [ ] Não há acesso a dados de outra clínica.

## Decisão arquitetural

O dashboard não será apenas uma tela de indicadores. Ele será um condutor clínico-operacional do fisioterapeuta dentro do PilatesVision.

A primeira versão deve ser simples, mas já preparar o comportamento futuro de assistente inteligente.

## Resultado esperado

Ao final do Sprint 2.2, o MVP terá sua primeira experiência real de produto:

```text
entrar → criar clínica → ver dashboard → saber o próximo passo
```
