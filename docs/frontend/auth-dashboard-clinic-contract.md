# Frontend Contract — Auth, Dashboard e Clínica

## Objetivo

Definir o contrato mínimo para o front-end do PilatesVision implementar login, onboarding da clínica e dashboard inicial usando Supabase.

## Variáveis de ambiente

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Cliente Supabase

Arquivo sugerido:

```text
src/lib/supabaseClient.ts
```

Responsabilidades:

- Criar cliente Supabase.
- Expor sessão atual.
- Escutar mudanças de autenticação.
- Evitar uso de service role no front-end.

## Rotas

```text
/login
/onboarding/clinic
/dashboard
/settings/clinic
```

## Guardas de rota

### AuthGuard

Se não houver sessão:

```text
redirect /login
```

### ClinicGuard

Se houver sessão, mas não houver clínica:

```text
redirect /onboarding/clinic
```

Se houver clínica:

```text
render dashboard
```

## Serviços Supabase

Arquivo sugerido:

```text
src/services/clinicService.ts
```

### getMyClinic

Entrada:

```ts
userId: string;
```

Consulta:

```ts
supabase.from("clinics").select("*").eq("owner_user_id", userId).limit(1).maybeSingle();
```

### createClinic

Entrada:

```ts
{
  name: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  owner_user_id: string
}
```

Consulta:

```ts
supabase.from("clinics").insert(payload).select("*").single();
```

### updateClinic

Entrada:

```ts
clinicId: string;
payload: Partial<Clinic>;
```

Consulta:

```ts
supabase.from("clinics").update(payload).eq("id", clinicId).select("*").single();
```

## Tipos mínimos

```ts
export type Clinic = {
  id: string;
  name: string;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  plan: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
};
```

## Tela Login

Componentes:

- Logo PilatesVision
- Campo e-mail
- Campo senha
- Botão entrar
- Botão criar conta
- Mensagem de erro simples

Após login:

```text
verificar clínica → dashboard ou onboarding
```

## Tela Onboarding Clínica

Campos MVP:

- Nome da clínica ou estúdio
- E-mail
- Telefone
- Endereço

CTA principal:

```text
Criar minha clínica
```

Após criar:

```text
redirect /dashboard
```

## Dashboard MVP

### Header

```text
Bem-vindo ao PilatesVision
Clínica: {clinic.name}
```

### Cards

```text
Pacientes cadastrados: 0
Avaliações realizadas: 0
Relatórios emitidos: 0
Próximo passo: cadastrar primeiro paciente
```

### NextStepCards

1. Completar dados da clínica.
2. Cadastrar primeiro paciente.
3. Realizar primeira avaliação postural.
4. Gerar primeiro relatório.

## Estados de erro

### Falha ao carregar clínica

Mensagem:

```text
Não conseguimos carregar os dados da clínica. Tente novamente.
```

### Falha ao criar clínica

Mensagem:

```text
Não foi possível criar a clínica. Verifique os dados e tente novamente.
```

### Sem permissão

Mensagem:

```text
Você não tem permissão para acessar esta clínica.
```

## UX clínica

O dashboard deve conduzir o fisioterapeuta ao próximo passo, não apenas mostrar números vazios.

A primeira experiência deve ser:

```text
simples → clara → profissional → confiável
```

## Checklist de implementação

- [ ] Configurar Supabase client.
- [ ] Implementar login.
- [ ] Implementar criação de conta.
- [ ] Implementar AuthGuard.
- [ ] Implementar ClinicGuard.
- [ ] Criar tela de onboarding da clínica.
- [ ] Criar dashboard inicial.
- [ ] Validar RLS com usuário real.
- [ ] Testar fluxo completo: login → criar clínica → dashboard.
