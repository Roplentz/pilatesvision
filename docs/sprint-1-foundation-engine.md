# Sprint 1 — Foundation Engine

## Status

Em execução.

## Entregas criadas

- Esquema inicial do banco clínico.
- Índices principais.
- Plano de storage privado.
- Dados seed para biblioteca inicial de exercícios.
- Migração inicial placeholder para Supabase.
- Arquitetura backend.
- API map.
- Vision Engine.
- Clinical Engine.
- Report Engine.
- Decisão arquitetural sobre Supabase.
- Template para avaliação open source.

## Próximo bloco

Sprint 1.2 deve implementar:

- scripts finais de RLS no Supabase;
- dashboard inicial Streamlit;
- conexão com Supabase;
- cadastro de paciente;
- upload privado de mídia;
- primeira tabela de avaliações.

## Observação crítica

A política de RLS precisa ser testada dentro do Supabase real antes de uso com pacientes.

Banco sem RLS testado é igual porta de consultório aberta: parece arejado, mas dá problema.
