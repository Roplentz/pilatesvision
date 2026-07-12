#!/usr/bin/env bash
set -euo pipefail

command -v docker >/dev/null || {
  echo "Docker não encontrado. Instale Docker Desktop e tente novamente." >&2
  exit 1
}
command -v supabase >/dev/null || {
  echo "Supabase CLI não encontrado. Veja https://supabase.com/docs/guides/local-development/cli/getting-started" >&2
  exit 1
}
command -v psql >/dev/null || {
  echo "psql não encontrado. Instale o cliente PostgreSQL." >&2
  exit 1
}

cleanup() {
  if [[ "${KEEP_SUPABASE_RUNNING:-0}" != "1" ]]; then
    supabase stop --no-backup >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

supabase start -x studio,imgproxy,inbucket,edge-runtime,logflare,vector
supabase db reset --local
PGPASSWORD=postgres psql   "postgresql://postgres:postgres@127.0.0.1:54322/postgres"   -v ON_ERROR_STOP=1   -f supabase/tests/rls_isolation.sql

supabase status
echo "Supabase local reconstruído e teste RLS concluído."
