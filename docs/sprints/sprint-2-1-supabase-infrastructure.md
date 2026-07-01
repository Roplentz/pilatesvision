# Sprint 2.1 — Supabase Infrastructure

## Objetivo

Criar a fundação de dados do MVP do PilatesVision, garantindo que clínicas, profissionais, pacientes, avaliações, mídia, métricas, escores e relatórios estejam organizados de forma segura, escalável e pronta para integração com Lovable e com o motor clínico.

## Entregas concluídas

### 1. Schema MVP

Arquivo:

```text
supabase/migrations/2026070101_mvp_core_schema.sql
```

Inclui:

- clinics
- professionals
- patients
- assessments
- assessment_media
- pose_landmarks
- biomechanical_metrics
- clinical_scores
- clinical_insights
- reports

### 2. Segurança RLS

Arquivo:

```text
supabase/migrations/2026070102_mvp_rls_policies.sql
```

Inclui:

- Row Level Security ativado nas tabelas principais.
- Função `user_has_clinic_access`.
- Políticas por clínica.
- Acesso de owner e profissionais vinculados.

### 3. Storage

Arquivo:

```text
supabase/migrations/2026070103_mvp_storage_setup.sql
```

Buckets:

- assessment-media
- report-pdfs
- clinic-assets

Padrão de paths:

```text
assessment-media/{clinic_id}/{patient_id}/{assessment_id}/{filename}
report-pdfs/{clinic_id}/{patient_id}/{assessment_id}/{filename}
clinic-assets/{clinic_id}/{filename}
```

## Fluxo suportado

```text
Usuário autenticado
↓
Cria ou acessa clínica
↓
Cadastra profissional
↓
Cadastra paciente
↓
Cria avaliação
↓
Faz upload de imagem
↓
Armazena landmarks e métricas
↓
Gera scores e insights
↓
Gera PDF
↓
Consulta histórico
```

## Decisões arquiteturais

### 1. Clínica como unidade de segurança

A clínica é o eixo principal de isolamento dos dados. Isso facilita:

- multi-clínica;
- controle de acesso;
- planos comerciais;
- LGPD;
- expansão futura.

### 2. Dados brutos separados de interpretações clínicas

Landmarks, métricas, scores e insights ficam em tabelas distintas. Isso permite auditoria e explicabilidade.

### 3. Storage privado para dados clínicos

Imagens de avaliação e PDFs ficam privados. Apenas assets institucionais podem ser públicos.

### 4. Preparação para Explainable Clinical AI

As tabelas `clinical_scores` e `clinical_insights` já possuem campos de explicação, confiança e evidências.

## Pendências técnicas

- Testar migrations no Supabase real.
- Verificar se `storage.foldername(name)` funciona conforme esperado no ambiente do projeto.
- Ajustar policies caso o fluxo de cadastro de clínica exija onboarding antes de professional vinculado.
- Criar seed mínimo para ambiente de teste.
- Criar types TypeScript a partir do schema.

## Próximo passo

Sprint 2.2 — Dashboard, Login e Cadastro de Clínica.

Objetivo do próximo sprint:

```text
Usuário entra no sistema
↓
cria sua clínica
↓
acessa dashboard inicial
```

## Resultado

O PilatesVision agora tem uma fundação de banco e storage compatível com um MVP clínico real, com separação por clínica, segurança por RLS e estrutura preparada para avaliação postural, relatórios e evolução clínica.
