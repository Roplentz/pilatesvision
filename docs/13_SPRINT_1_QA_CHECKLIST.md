# PilatesVision — Sprint 1 QA Checklist

**Sprint:** Sprint 1 — Fundação SaaS  
**Objetivo:** validar autenticação, criação de clínica, perfil, rotas protegidas, RLS e build antes de avançar para Sprint 2.

---

## 1. Pré-requisitos

Antes de iniciar o QA:

- [ ] Aplicar migrations no Supabase.
- [ ] Confirmar variáveis de ambiente do Supabase.
- [ ] Rodar instalação local.
- [ ] Confirmar que o projeto abre em modo desenvolvimento.

```bash
bun install
bun run dev
```

---

## 2. Validação técnica local

Rodar obrigatoriamente:

```bash
bun run lint
bun run typecheck
bun run build
bun run ci
```

Critério de aceite:

- [ ] `lint` sem erro crítico.
- [ ] `typecheck` sem erro.
- [ ] `build` sem erro.
- [ ] `ci` sem erro.

---

## 3. Validação de autenticação

### Cadastro

- [ ] Criar novo usuário.
- [ ] Confirmar criação no Supabase Auth.
- [ ] Confirmar criação de registro em `profiles`.
- [ ] Confirmar criação/vínculo com clínica.

### Login

- [ ] Entrar com credenciais válidas.
- [ ] Confirmar redirecionamento para dashboard.
- [ ] Testar senha incorreta.
- [ ] Confirmar mensagem de erro amigável.

### Logout

- [ ] Clicar em sair.
- [ ] Confirmar redirecionamento para `/auth`.
- [ ] Tentar voltar para rota interna.
- [ ] Confirmar bloqueio de acesso.

---

## 4. Validação de rotas protegidas

Com usuário deslogado, tentar acessar:

- [ ] `/dashboard`
- [ ] `/alunos`
- [ ] `/avaliacoes`
- [ ] `/relatorios`
- [ ] `/configuracoes`
- [ ] `/admin`

Critério de aceite:

- [ ] Todas redirecionam para `/auth`.

Atalhos públicos:

- [ ] `/login` redireciona para entrada.
- [ ] `/signup` redireciona para cadastro.

---

## 5. Validação de clínica e perfil

Com usuário autenticado:

- [ ] Abrir Configurações.
- [ ] Ver nome da clínica.
- [ ] Editar nome da clínica.
- [ ] Editar e-mail da clínica.
- [ ] Editar telefone.
- [ ] Editar cidade.
- [ ] Editar UF.
- [ ] Salvar.
- [ ] Recarregar página.
- [ ] Confirmar persistência.

Perfil:

- [ ] Editar nome completo.
- [ ] Salvar.
- [ ] Recarregar.
- [ ] Confirmar persistência.

---

## 6. Teste de isolamento multi-clínica

Criar dois usuários de teste:

```txt
Usuário A → Clínica Alfa
Usuário B → Clínica Beta
```

### Usuário A

- [ ] Login como Usuário A.
- [ ] Confirmar que vê Clínica Alfa.
- [ ] Confirmar que não vê Clínica Beta.
- [ ] Editar Clínica Alfa.
- [ ] Confirmar persistência.

### Usuário B

- [ ] Login como Usuário B.
- [ ] Confirmar que vê Clínica Beta.
- [ ] Confirmar que não vê Clínica Alfa.
- [ ] Editar Clínica Beta.
- [ ] Confirmar persistência.

### Tentativa de acesso cruzado

- [ ] Capturar ID da Clínica Beta.
- [ ] Login como Usuário A.
- [ ] Tentar acessar ou consultar Clínica Beta.
- [ ] Confirmar bloqueio por RLS.
- [ ] Capturar ID da Clínica Alfa.
- [ ] Login como Usuário B.
- [ ] Tentar acessar ou consultar Clínica Alfa.
- [ ] Confirmar bloqueio por RLS.

Critério de aceite:

- [ ] Nenhum usuário visualiza ou altera dados da clínica do outro.

---

## 7. Validação do dashboard

Com usuário autenticado:

- [ ] Abrir dashboard.
- [ ] Confirmar que não há métricas falsas.
- [ ] Confirmar total real de pacientes.
- [ ] Confirmar total real de avaliações.
- [ ] Confirmar total real de relatórios.
- [ ] Confirmar CTA para cadastrar paciente.
- [ ] Confirmar CTA para criar avaliação.
- [ ] Confirmar CTA para relatórios.

Critério de aceite:

- [ ] Dashboard usa dados reais da clínica.

---

## 8. Decisão para avançar à Sprint 2

A Sprint 1 só pode ser considerada pronta quando:

- [ ] Auth funciona.
- [ ] Profile é criado.
- [ ] Clínica é criada.
- [ ] Usuário fica vinculado à clínica.
- [ ] Rotas internas estão protegidas.
- [ ] RLS impede acesso cruzado.
- [ ] Configurações persistem dados.
- [ ] Dashboard usa dados reais.
- [ ] Build passa.

---

## 9. Frase de aprovação

```txt
Sprint 1 aprovada: a fundação SaaS está segura, autenticada e isolada por clínica.
```
