-- Sprint 1 — Fundação SaaS
-- Garante as tabelas centrais do PilatesVision: clinics e profiles.
-- Compatível com o contrato atual do app, onde profiles.id = auth.users.id.

create extension if not exists pgcrypto;

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null default ('clinic-' || substr(gen_random_uuid()::text, 1, 8)),
  logo_url text,
  email text,
  phone text,
  address jsonb,
  city text,
  state text,
  plan text not null default 'starter',
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clinics
  add column if not exists slug text,
  add column if not exists logo_url text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address jsonb,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists plan text not null default 'starter',
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.clinics
  alter column slug set default ('clinic-' || substr(gen_random_uuid()::text, 1, 8)),
  alter column plan set default 'starter';

update public.clinics
set slug = 'clinic-' || substr(id::text, 1, 8)
where slug is null;

alter table public.clinics
  alter column slug set not null;

create unique index if not exists clinics_slug_key on public.clinics (slug);
create index if not exists clinics_owner_user_id_idx on public.clinics (owner_user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  full_name text,
  avatar_url text,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists clinic_id uuid references public.clinics(id) on delete set null,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists role text not null default 'owner',
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  alter column role set default 'owner';

create index if not exists profiles_clinic_id_idx on public.profiles (clinic_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clinics_updated_at on public.clinics;
create trigger set_clinics_updated_at
before update on public.clinics
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
