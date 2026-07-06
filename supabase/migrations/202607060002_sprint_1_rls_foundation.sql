-- Sprint 1 — Fundação SaaS
-- RLS e isolamento multi-clínica para clinics e profiles.
-- Compatível com o contrato atual do app: profiles.id = auth.users.id.

create or replace function public.current_user_clinic_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.clinic_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_clinic_owner(clinic_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.clinics c
    where c.id = clinic_id
      and c.owner_user_id = auth.uid()
  );
$$;

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;

-- -----------------------------------------------------------------------------
-- clinics policies
-- -----------------------------------------------------------------------------

drop policy if exists "Users can read their own clinic" on public.clinics;
create policy "Users can read their own clinic"
on public.clinics
for select
to authenticated
using (
  id = public.current_user_clinic_id()
  or owner_user_id = auth.uid()
);

drop policy if exists "Users can create their own clinic" on public.clinics;
create policy "Users can create their own clinic"
on public.clinics
for insert
to authenticated
with check (
  owner_user_id = auth.uid()
);

drop policy if exists "Clinic owners can update their clinic" on public.clinics;
create policy "Clinic owners can update their clinic"
on public.clinics
for update
to authenticated
using (
  owner_user_id = auth.uid()
  or id = public.current_user_clinic_id()
)
with check (
  owner_user_id = auth.uid()
  or id = public.current_user_clinic_id()
);

-- Não criar policy de delete no MVP.
-- Clínicas devem ser desativadas/arquivadas futuramente, não apagadas fisicamente.

-- -----------------------------------------------------------------------------
-- profiles policies
-- -----------------------------------------------------------------------------

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

-- Não criar policy de delete no MVP.
-- Profiles são parte da trilha de auditoria do usuário.

grant execute on function public.current_user_clinic_id() to authenticated;
grant execute on function public.is_clinic_owner(uuid) to authenticated;
