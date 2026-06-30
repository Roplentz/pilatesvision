# Row Level Security — PilatesVision

Este documento define a política de segurança inicial para o Supabase.

## Princípio

Dados clínicos nunca devem ser públicos.

Todo dado sensível deve pertencer a uma clínica e só pode ser acessado por usuários vinculados a essa clínica.

## Tabelas com RLS obrigatório

- clinics
- profiles
- patients
- patient_consents
- anamneses
- assessments
- pain_scores
- media_files
- pose_landmarks
- movement_metrics
- clinical_findings
- exercise_sessions
- reports
- clinical_events
- audit_logs

## Funções auxiliares sugeridas

```sql
create or replace function public.current_user_clinic_id()
returns uuid
language sql
as $$
  select clinic_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql
as $$
  select role from public.profiles where id = auth.uid()
$$;
```

## Política geral

### Leitura

Usuários autenticados podem ler registros apenas da própria clínica.

```sql
using (clinic_id = public.current_user_clinic_id())
```

### Escrita

Apenas perfis administrativos, gestores e fisioterapeutas podem criar ou alterar dados clínicos.

```sql
with check (
  clinic_id = public.current_user_clinic_id()
  and public.current_user_role() in ('admin','manager','physiotherapist')
)
```

## Pacientes

- Admin: leitura e escrita na clínica.
- Gestor: leitura e escrita na clínica.
- Fisioterapeuta: leitura e escrita na clínica.
- Estagiário: leitura controlada.
- Paciente: leitura futura apenas do próprio registro.

## Mídias clínicas

Fotos, vídeos e relatórios devem ficar em bucket privado.

A URL pública não deve ser usada para material clínico.

## Auditoria

Toda ação relevante deve gerar evento em `audit_logs` ou `clinical_events`.

Exemplos:

- paciente criado;
- avaliação criada;
- mídia enviada;
- relatório gerado;
- relatório finalizado;
- IA executada.

## Observação

As políticas SQL definitivas devem ser aplicadas no Supabase após criação do projeto e teste com usuários reais.
