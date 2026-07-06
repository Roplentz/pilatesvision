# PilatesVision — Sprint 4: Relatórios Evolutivos

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Sprint:** Sprint 4  
**Nome da Sprint:** Relatórios Evolutivos  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo da Sprint

A Sprint 4 tem como objetivo transformar avaliações clínicas finalizadas em relatórios visuais, profissionais, editáveis, seguros e prontos para entrega ao paciente.

Ao final desta sprint, o sistema deve permitir:

**Usuário logado → abre avaliação finalizada → gera relatório → revisa conteúdo → edita texto → finaliza relatório → salva no histórico → exporta PDF.**

Esta é a sprint que transforma o PilatesVision em produto vendável.

Cadastro é necessário.  
Avaliação é clínica.  
Relatório é percepção de valor.

É aqui que o paciente olha e pensa: “essa clínica é diferente”.

---

## 2. Resultado Esperado

Ao final da Sprint 4, o PilatesVision deve ter:

1. Tabela `reports` criada ou validada.
2. RLS aplicada por clínica.
3. Geração de relatório a partir de avaliação finalizada.
4. Visualização premium do relatório.
5. Edição do conteúdo antes da finalização.
6. Salvamento do relatório no histórico do paciente.
7. Exportação PDF simples.
8. Dados da clínica no cabeçalho.
9. Dados do paciente.
10. Resumo da avaliação.
11. Achados posturais.
12. Achados dinâmicos.
13. Achados por exercício.
14. Recomendações profissionais.
15. Disclaimer clínico obrigatório.
16. Status do relatório: rascunho, finalizado e arquivado.

---

## 3. Escopo da Sprint

### Entra na Sprint 4

- Criar tabela `reports`.
- Criar fluxo “Gerar relatório”.
- Gerar relatório a partir de uma avaliação finalizada.
- Montar conteúdo inicial automaticamente com base nos dados da avaliação.
- Permitir edição manual pelo profissional.
- Criar tela premium de visualização do relatório.
- Salvar relatório no Supabase.
- Exibir relatórios no perfil do paciente.
- Exportar PDF simples.
- Aplicar RLS por clínica.
- Inserir disclaimer clínico obrigatório.
- Permitir versionamento básico.

### Não entra na Sprint 4

- IA gerando interpretação clínica avançada.
- PDF ultra customizado por template.
- Assinatura digital.
- Envio por WhatsApp.
- Envio por e-mail.
- Portal do paciente.
- Comparação evolutiva avançada.
- Gráficos complexos.
- API Python.
- Motion AI.
- Digital Twin.
- Marketplace.

Esta sprint é relatório. Não é gráfica, não é cartório, não é NASA. Ainda.

---

## 4. Prioridade Estratégica

A prioridade absoluta desta sprint é:

**Gerar um relatório bonito, claro e clinicamente prudente a partir de uma avaliação real.**

O relatório é o primeiro grande produto percebido pelo usuário.

Ele precisa ser:

- Bonito.
- Rápido.
- Editável.
- Seguro.
- Clinicamente responsável.
- Fácil de exportar.
- Útil para o paciente.
- Útil para o profissional.

O MVP começa a valer dinheiro quando o relatório fica melhor do que aquilo que a clínica já entrega hoje.

---

## 5. Módulos Envolvidos

### 5.1 Frontend

Responsável por:

- Botão “Gerar relatório”.
- Tela de relatório.
- Editor simples.
- Visualização premium.
- Exportação PDF.
- Listagem no histórico do paciente.
- Estados de erro.
- Estados vazios.

### 5.2 Supabase Database

Responsável por:

- Persistir relatórios.
- Relacionar relatório com clínica.
- Relacionar relatório com paciente.
- Relacionar relatório com avaliação.
- Armazenar conteúdo estruturado.
- Controlar status e versão.

### 5.3 Segurança

Responsável por:

- RLS por `clinic_id`.
- Impedir acesso cruzado entre clínicas.
- Proteger relatórios clínicos.
- Garantir que o relatório só seja gerado para avaliações da própria clínica.

### 5.4 Exportação

Responsável por:

- Gerar PDF simples.
- Manter layout profissional.
- Incluir disclaimer.
- Evitar perda de conteúdo clínico.

---

## 6. Modelo de Dados da Sprint 4

Tabela principal:

```txt
reports
```

---

# 7. Tabela `reports`

## Objetivo

Representar um relatório clínico evolutivo gerado a partir de uma avaliação.

## SQL sugerido

```sql
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  plain_text text,
  pdf_url text,
  status text not null default 'draft',
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  finalized_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 8. Campos da Tabela

### Campos obrigatórios

- `id`
- `clinic_id`
- `student_id`
- `assessment_id`
- `title`
- `content`
- `status`
- `version`
- `created_at`

### Campos recomendados

- `plain_text`
- `pdf_url`
- `created_by`
- `finalized_at`
- `archived_at`
- `updated_at`

---

## 9. Status do Relatório

Usar inicialmente:

```txt
draft
finalized
archived
```

### Significado

- `draft`: relatório criado, mas ainda editável.
- `finalized`: relatório revisado e finalizado pelo profissional.
- `archived`: relatório ocultado da rotina, mas preservado no histórico.

### Regra

Relatório finalizado não deve ser alterado silenciosamente.

Se precisar mudar algo relevante, criar nova versão.

Relatório clínico não é post de Instagram. Não se edita depois como se nada tivesse acontecido.

---

## 10. Estrutura Sugerida do Campo `content`

Usar `jsonb` para permitir flexibilidade.

```json
{
  "clinic": {
    "name": "Clínica Exemplo",
    "responsible": "Profissional Responsável",
    "city": "Porto Alegre",
    "state": "RS",
    "logo_url": null
  },
  "student": {
    "name": "Maria Teste",
    "age": 52,
    "sex": "Feminino"
  },
  "assessment": {
    "date": "2026-07-05",
    "type": "complete",
    "objective": "Avaliação inicial para acompanhamento no Pilates clínico.",
    "main_complaint": "Dor lombar ao permanecer sentada por longos períodos.",
    "pain_score": 4
  },
  "summary": {
    "title": "Resumo da Avaliação",
    "text": "A avaliação sugere alterações posturais e compensações funcionais leves, que devem ser acompanhadas clinicamente."
  },
  "postural_findings": [],
  "movement_findings": [],
  "exercise_findings": [],
  "recommendations": [],
  "plan": {
    "frequency": "2 a 3 vezes por semana",
    "focus": "Controle motor, mobilidade e fortalecimento progressivo",
    "duration": "4 a 6 semanas antes da reavaliação"
  },
  "professional_notes": "",
  "disclaimer": "Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável."
}
```

---

# 11. RLS — Row Level Security

## Regra central

Usuário só pode acessar relatórios da própria clínica.

### Ativar RLS

```sql
alter table public.reports enable row level security;
```

### Política de leitura

```sql
create policy "Users can read reports from their clinic"
on public.reports
for select
using (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de criação

```sql
create policy "Users can create reports in their clinic"
on public.reports
for insert
with check (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de atualização

```sql
create policy "Users can update reports from their clinic"
on public.reports
for update
using (
  clinic_id = public.current_user_clinic_id()
)
with check (
  clinic_id = public.current_user_clinic_id()
);
```

### Política de arquivamento

Arquivamento pode ser feito por update:

```txt
status = archived
archived_at = now()
```

Não usar exclusão física no MVP.

---

# 12. Fluxo Principal do Relatório

## Jornada 1 — Gerar relatório

1. Usuário abre perfil do paciente.
2. Acessa uma avaliação finalizada.
3. Clica em “Gerar relatório”.
4. Sistema busca:
   - Dados da clínica.
   - Dados do paciente.
   - Dados da avaliação.
   - Achados posturais.
   - Achados dinâmicos.
   - Achados por exercício.
5. Sistema cria relatório em status `draft`.
6. Usuário é levado para tela de edição/visualização.

## Jornada 2 — Revisar relatório

1. Usuário revisa resumo.
2. Edita achados, recomendações e plano.
3. Ajusta observações profissionais.
4. Confirma linguagem clínica.
5. Salva rascunho.

## Jornada 3 — Finalizar relatório

1. Usuário clica em “Finalizar relatório”.
2. Sistema valida campos obrigatórios.
3. Status muda para `finalized`.
4. `finalized_at` é preenchido.
5. Relatório fica disponível no histórico.

## Jornada 4 — Exportar PDF

1. Usuário abre relatório finalizado.
2. Clica em “Exportar PDF”.
3. Sistema gera PDF simples.
4. PDF mantém layout profissional.
5. PDF inclui disclaimer obrigatório.

---

# 13. Tela “Relatório Evolutivo”

## Elementos mínimos

- Cabeçalho com marca PilatesVision e/ou clínica.
- Nome da clínica.
- Dados do paciente.
- Data da avaliação.
- Tipo da avaliação.
- Resumo clínico.
- Achados posturais.
- Achados dinâmicos.
- Achados por exercício.
- Recomendações.
- Plano sugerido.
- Observações do profissional.
- Disclaimer clínico.
- Botões:
  - Salvar rascunho.
  - Finalizar relatório.
  - Exportar PDF.
  - Voltar ao paciente.

---

## 14. Estrutura Visual do Relatório

### 14.1 Cabeçalho

Deve conter:

- Logo da clínica, se houver.
- Nome da clínica.
- Título: “Relatório Evolutivo PilatesVision”.
- Data de emissão.
- Nome do profissional, se disponível.

### 14.2 Identificação do paciente

Campos:

- Nome.
- Idade ou data de nascimento.
- Sexo.
- Objetivo principal.
- Queixa principal.

### 14.3 Resumo da avaliação

Texto curto, gerado a partir da avaliação.

Exemplo:

```txt
A avaliação realizada teve como objetivo analisar aspectos posturais, funcionais e de controle motor relacionados ao acompanhamento no Pilates clínico. Os achados descritos abaixo devem ser interpretados como apoio à decisão profissional.
```

### 14.4 Achados posturais

Exibir:

- Vista avaliada.
- Região.
- Achado observado.
- Severidade.
- Observações.

### 14.5 Achados dinâmicos

Exibir:

- Movimento avaliado.
- Compensação observada.
- Severidade.
- Observações.

### 14.6 Achados por exercício

Exibir:

- Exercício.
- Aparelho.
- Nível de controle.
- Compensações.
- Recomendação.

### 14.7 Recomendações

Exibir recomendações profissionais editáveis.

Exemplos:

- Priorizar controle lombopélvico.
- Trabalhar mobilidade torácica.
- Evitar progressões com dor.
- Reavaliar em 4 a 6 semanas.
- Ajustar carga conforme tolerância.
- Monitorar resposta aos exercícios.

### 14.8 Plano inicial

Campos editáveis:

- Frequência sugerida.
- Foco terapêutico.
- Duração até reavaliação.
- Observações.

### 14.9 Disclaimer obrigatório

Todo relatório deve conter:

```txt
Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável.
```

---

# 15. Editor do Relatório

## Objetivo

Permitir que o profissional revise e personalize o relatório antes da finalização.

## Campos editáveis

- Título.
- Resumo clínico.
- Achados.
- Recomendações.
- Plano inicial.
- Observações profissionais.

## Campos não editáveis diretamente

- `clinic_id`
- `student_id`
- `assessment_id`
- `created_by`
- `version`

## Critérios de aceite

- Usuário consegue editar conteúdo.
- Alterações persistem.
- Conteúdo não perde vínculo com avaliação.
- Usuário não altera relatório de outra clínica.
- Relatório finalizado exige confirmação.

---

# 16. Geração Automática Inicial do Conteúdo

No MVP, a geração não precisa usar IA.

Ela pode usar templates estruturados.

### Exemplo de template de resumo

```txt
A avaliação de {student_name} foi realizada com foco em {objective}. A queixa principal relatada foi {main_complaint}. Os achados registrados pelo profissional sugerem pontos de atenção relacionados à postura, controle motor e execução dos exercícios avaliados.
```

### Exemplo de recomendação padrão

```txt
Recomenda-se utilizar os achados deste relatório como apoio para definição do plano de exercícios, respeitando tolerância, dor, controle motor e evolução clínica do paciente.
```

### Regra

O sistema pode montar o relatório, mas o profissional deve revisar.

Automação sem revisão clínica é atalho para dor de cabeça. E não a dor que o Pilates resolve.

---

# 17. Exportação PDF

## Objetivo

Permitir que o profissional entregue ou arquive o relatório em PDF.

## Nível do MVP

PDF simples e funcional.

Não precisa ter:

- Designer editorial avançado.
- Assinatura digital.
- Marca d’água.
- Templates múltiplos.
- Envio automático.

Precisa ter:

- Layout limpo.
- Cabeçalho.
- Seções organizadas.
- Dados corretos.
- Disclaimer.
- Boa legibilidade.

## Critérios de aceite

- Usuário consegue exportar PDF.
- PDF contém dados do paciente.
- PDF contém dados da avaliação.
- PDF contém achados e recomendações.
- PDF contém disclaimer.
- PDF não quebra layout em conteúdo médio.
- PDF pode ser baixado pelo usuário.

---

# 18. Histórico de Relatórios no Perfil do Paciente

## Elementos mínimos

No perfil do paciente, exibir:

- Data do relatório.
- Título.
- Avaliação vinculada.
- Status.
- Versão.
- Botão “Abrir relatório”.
- Botão “Exportar PDF”, se finalizado.

## Estado vazio

```txt
Nenhum relatório gerado ainda.

Finalize uma avaliação para criar o primeiro relatório evolutivo deste paciente.
```

## Critérios de aceite

- Relatórios aparecem no perfil do paciente.
- Relatórios são ordenados do mais recente para o mais antigo.
- Usuário só vê relatórios da própria clínica.
- Relatórios finalizados ficam identificados.

---

# 19. Versionamento Básico

## Regra inicial

Cada relatório começa com:

```txt
version = 1
```

Se relatório finalizado precisar de alteração relevante, o sistema deve futuramente criar nova versão.

### Para Sprint 4

No MVP, permitir:

- Editar enquanto `draft`.
- Finalizar.
- Evitar edição livre após `finalized`.

### Futuro

- Duplicar relatório finalizado.
- Criar versão 2.
- Manter histórico de versões.

---

# 20. Linguagem Clínica

## Usar

- “Achados observados”
- “Sugere”
- “Pode indicar”
- “Recomenda-se considerar”
- “Deve ser confirmado clinicamente”
- “Apoio à decisão profissional”
- “Acompanhamento evolutivo”

## Evitar

- “Diagnóstico”
- “Patologia confirmada”
- “Correção garantida”
- “Tratamento obrigatório”
- “IA detectou”
- “Resultado definitivo”

O relatório deve parecer moderno, mas não arrogante. Tecnologia boa ajuda. Tecnologia metida vira problema.

---

# 21. Estados de Erro

## Erros possíveis

- Avaliação não finalizada.
- Avaliação não encontrada.
- Paciente não encontrado.
- Falha ao gerar relatório.
- Falha ao salvar relatório.
- Falha ao finalizar relatório.
- Falha ao exportar PDF.
- Acesso não autorizado.

## Mensagens sugeridas

```txt
Não foi possível gerar o relatório. Verifique se a avaliação foi finalizada.
```

```txt
Relatório não encontrado ou sem permissão de acesso.
```

```txt
Não foi possível salvar as alterações do relatório.
```

```txt
Não foi possível exportar o PDF. Tente novamente.
```

---

# 22. Critérios de Aceite da Sprint

A Sprint 4 será considerada concluída quando:

1. Tabela `reports` estiver criada.
2. RLS estiver ativa.
3. Usuário conseguir gerar relatório a partir de avaliação finalizada.
4. Relatório for salvo com `clinic_id`.
5. Relatório for salvo com `student_id`.
6. Relatório for salvo com `assessment_id`.
7. Conteúdo inicial for montado a partir da avaliação.
8. Usuário conseguir editar relatório em rascunho.
9. Usuário conseguir finalizar relatório.
10. Relatório aparecer no perfil do paciente.
11. Usuário conseguir exportar PDF simples.
12. PDF incluir disclaimer clínico.
13. Usuário não conseguir ver relatórios de outra clínica.
14. Build rodar sem erro.

---

# 23. Definition of Done da Sprint 4

Uma tarefa só será considerada pronta quando:

- Estiver implementada.
- Estiver conectada ao Supabase.
- Respeitar `clinic_id`.
- Respeitar `student_id`.
- Respeitar `assessment_id`.
- Respeitar RLS.
- Tiver tratamento básico de erro.
- Tiver linguagem clínica prudente.
- Tiver disclaimer obrigatório.
- Não permitir diagnóstico automático.
- Não quebrar avaliações.
- Não quebrar pacientes.
- Não quebrar autenticação.
- Passar em build.

---

# 24. Checklist Técnico

## Supabase

- [ ] Criar tabela `reports`.
- [ ] Adicionar índice para `clinic_id`.
- [ ] Adicionar índice para `student_id`.
- [ ] Adicionar índice para `assessment_id`.
- [ ] Ativar RLS.
- [ ] Criar política de leitura.
- [ ] Criar política de criação.
- [ ] Criar política de atualização.
- [ ] Testar isolamento por clínica.

## Frontend

- [ ] Criar botão “Gerar relatório” em avaliação finalizada.
- [ ] Criar tela de relatório.
- [ ] Criar visualização premium.
- [ ] Criar editor simples.
- [ ] Criar ação de salvar rascunho.
- [ ] Criar ação de finalizar relatório.
- [ ] Criar listagem de relatórios no perfil do paciente.
- [ ] Criar exportação PDF simples.
- [ ] Criar mensagens de erro.
- [ ] Criar estado vazio de relatórios.

## Qualidade

- [ ] Testar geração de relatório.
- [ ] Testar edição.
- [ ] Testar finalização.
- [ ] Testar PDF.
- [ ] Testar histórico do paciente.
- [ ] Testar RLS com dois usuários.
- [ ] Rodar lint.
- [ ] Rodar typecheck.
- [ ] Rodar build.
- [ ] Rodar CI.

---

# 25. Comando de Validação Local

Rodar:

```bash
bun run lint
bun run typecheck
bun run build
bun run ci
```

Sprint 4 com build quebrado não finaliza.

Relatório bonito em app quebrado é igual jaleco passado em plantão sem oxigênio: aparência boa, função zero.

---

# 26. Prompt para Lovable — Sprint 4

Use este prompt para execução controlada:

```txt
Estamos executando a Sprint 4 do PilatesVision MVP 1.0: Relatórios Evolutivos.

Objetivo:
Implementar o módulo de relatórios evolutivos, conectado ao Supabase, seguro por clínica e gerado a partir de avaliações finalizadas.

Escopo:
1. Criar ou ajustar a tabela reports.
2. Garantir que todo relatório tenha clinic_id, student_id e assessment_id.
3. Aplicar RLS para impedir acesso cruzado entre clínicas.
4. Criar botão “Gerar relatório” em avaliações finalizadas.
5. Gerar relatório inicial a partir dos dados da avaliação, paciente e clínica.
6. Criar tela de visualização premium do relatório.
7. Criar editor simples para revisar resumo, achados, recomendações, plano e observações.
8. Permitir salvar relatório como draft.
9. Permitir finalizar relatório, mudando status para finalized e preenchendo finalized_at.
10. Exibir relatórios no perfil do paciente.
11. Criar exportação PDF simples.
12. Incluir disclaimer clínico obrigatório em todo relatório.
13. Bloquear edição livre de relatório finalizado ou exigir confirmação.
14. Manter version = 1 no MVP.

Estrutura mínima do relatório:
- Cabeçalho com clínica.
- Dados do paciente.
- Dados da avaliação.
- Resumo clínico.
- Achados posturais.
- Achados dinâmicos.
- Achados por exercício.
- Recomendações.
- Plano inicial.
- Observações profissionais.
- Disclaimer clínico.

Disclaimer obrigatório:
“Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável.”

Regras:
- Não implementar IA nesta etapa.
- Não implementar API Python.
- Não implementar Motion AI.
- Não implementar Digital Twin.
- Não implementar portal do paciente.
- Não implementar envio por WhatsApp ou e-mail.
- Não reconstruir o app do zero.
- Não alterar a arquitetura geral.
- Manter TypeScript strict.
- Garantir build sem erro.
- Usar linguagem clínica prudente.
- Não emitir diagnóstico automático.

Critérios de aceite:
- Usuário gera relatório a partir de avaliação finalizada.
- Relatório aparece no perfil do paciente.
- Usuário edita relatório em rascunho.
- Usuário finaliza relatório.
- Usuário exporta PDF.
- PDF inclui disclaimer.
- Usuário não vê relatórios de outra clínica.
- Build sem erro.
```

---

# 27. Prompt para Lovable — Correção de Relatórios

Usar apenas se o módulo de relatórios ficar com erro:

```txt
Revise apenas o módulo de Relatórios Evolutivos do PilatesVision.

Objetivo:
Corrigir problemas de geração, edição, finalização, histórico, exportação PDF ou segurança dos relatórios.

Não implemente IA.
Não implemente API Python.
Não implemente Motion AI.
Não implemente Digital Twin.
Não implemente portal do paciente.
Não altere o design global.
Não altere a arquitetura geral.
Não mexa no módulo de avaliações além do necessário para vincular relatórios.

Verifique:
1. Se a tabela reports está correta.
2. Se todo relatório recebe clinic_id.
3. Se todo relatório recebe student_id.
4. Se todo relatório recebe assessment_id.
5. Se a RLS impede acesso cruzado.
6. Se o relatório só é gerado a partir de avaliação finalizada.
7. Se o conteúdo inicial usa dados da avaliação.
8. Se salvar rascunho funciona.
9. Se finalizar relatório funciona.
10. Se o relatório aparece no perfil do paciente.
11. Se a exportação PDF funciona.
12. Se o disclaimer obrigatório aparece no relatório e no PDF.
13. Se o build está funcionando.

Corrija apenas o necessário.
```

---

# 28. Riscos da Sprint

## Risco 1 — Relatório gerado a partir de avaliação incompleta

**Impacto:** relatório fraco e pouco confiável.  
**Prevenção:** permitir geração apenas de avaliação `finalized`.

## Risco 2 — Relatório sem revisão profissional

**Impacto:** risco clínico e baixa qualidade.  
**Prevenção:** relatório nasce como `draft`.

## Risco 3 — PDF quebrado

**Impacto:** perda de valor percebido.  
**Prevenção:** PDF simples primeiro, bonito depois.

## Risco 4 — Linguagem diagnóstica

**Impacto:** risco clínico e regulatório.  
**Prevenção:** disclaimer e linguagem prudente.

## Risco 5 — Escopo virar plataforma de comunicação

**Impacto:** atraso.  
**Prevenção:** não implementar WhatsApp, e-mail ou portal do paciente agora.

---

# 29. Teste Manual Obrigatório

## Teste 1 — Gerar relatório

1. Login com usuário A.
2. Abrir paciente “Maria Teste”.
3. Abrir avaliação finalizada.
4. Clicar em “Gerar relatório”.
5. Confirmar criação do relatório em `draft`.
6. Confirmar dados do paciente e avaliação.

## Teste 2 — Editar relatório

1. Abrir relatório em rascunho.
2. Editar resumo clínico.
3. Editar recomendações.
4. Salvar.
5. Recarregar página.
6. Confirmar persistência.

## Teste 3 — Finalizar relatório

1. Abrir relatório em rascunho.
2. Clicar em “Finalizar relatório”.
3. Confirmar status `finalized`.
4. Confirmar `finalized_at`.

## Teste 4 — Histórico

1. Abrir perfil do paciente.
2. Verificar seção de relatórios.
3. Confirmar que o relatório aparece.
4. Abrir relatório pelo histórico.

## Teste 5 — PDF

1. Abrir relatório finalizado.
2. Clicar em “Exportar PDF”.
3. Confirmar download ou visualização.
4. Verificar se o PDF contém:
   - Dados da clínica.
   - Dados do paciente.
   - Achados.
   - Recomendações.
   - Disclaimer.

## Teste 6 — Segurança

1. Usuário A cria relatório para paciente A.
2. Usuário B cria relatório para paciente B.
3. Usuário A não vê relatório de B.
4. Usuário B não vê relatório de A.

---

# 30. Entrega Final da Sprint 4

A entrega final esperada é:

**Um módulo funcional de relatórios evolutivos, seguro por clínica, vinculado às avaliações e capaz de gerar PDF simples para entrega ao paciente.**

Ao terminar esta sprint, o PilatesVision terá seu primeiro fluxo de valor completo:

**Paciente → Avaliação → Relatório → PDF.**

Esse é o primeiro MVP realmente vendável.

---

# 31. Decisão Executiva

A Sprint 4 deve priorizar valor percebido.

O relatório não precisa ser perfeito.

Precisa ser melhor, mais bonito e mais útil do que o processo manual atual da clínica.

Se o relatório convencer o paciente, o SaaS começa a vender.

---

# 32. Frase de Foco da Sprint

**O relatório é o produto que o paciente enxerga.**

Essa é a regra.
