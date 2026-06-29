# Checklist — Autenticacao minima

## Objetivo

Implementar login simples com email e senha para acesso ao PilatesVision SaaS.

## Variaveis necessarias

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Regras de seguranca

- Usar somente chave publica anon no frontend.
- Nunca usar chave administrativa no frontend.
- Nao commitar arquivo local com chaves reais.
- Dados reais de pacientes apenas com consentimento e politicas LGPD.

## Fluxo minimo

1. Usuario abre o app.
2. Se nao estiver logado, mostra Login.
3. Usuario cria conta ou entra.
4. App mostra Dashboard interno.
5. Usuario acessa Alunos e demais paginas.
6. Usuario clica Sair.
7. App volta para Login.

## Criterios de aceite

- [ ] Login com email e senha funciona.
- [ ] Cadastro funciona.
- [ ] Logout funciona.
- [ ] Usuario nao logado nao acessa area interna.
- [ ] Dashboard abre apos login.
- [ ] Pagina Alunos abre apos login.
- [ ] Sem tela branca.
- [ ] Dados mockados continuam funcionando.

## Prompt economico para Lovable

```text
Implemente autenticacao minima com email e senha usando Supabase Auth.

Nao refaca o app.
Nao altere o design geral.
Nao implemente banco de alunos ainda.
Nao implemente IA.
Nao implemente upload.
Nao implemente PDF.

Criar:
- tela Login;
- tela Cadastro;
- controle de sessao;
- protecao das paginas internas;
- botao Sair.

Usar variaveis:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Manter dados mockados.

Criterio de aceite:
Usuario cria conta, entra, acessa Dashboard, acessa Alunos e consegue sair.
```
