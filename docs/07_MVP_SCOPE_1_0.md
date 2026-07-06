# PilatesVision — MVP Scope 1.0

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Nome interno:** Avaliação Inteligente e Relatório Evolutivo  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo do MVP

O MVP 1.0 do PilatesVision tem um objetivo central:

**Permitir que uma clínica ou fisioterapeuta cadastre pacientes, realize avaliações simples e gere relatórios clínicos visuais, premium e evolutivos.**

O MVP não precisa demonstrar toda a visão futura do PilatesVision.

Ele precisa provar que o produto resolve um problema real, gera valor percebido e pode ser vendido.

---

## 2. Hipótese Principal

A hipótese principal do MVP é:

**Clínicas e profissionais de Pilates pagarão por uma ferramenta que transforme avaliações clínicas em relatórios visuais, padronizados e evolutivos, aumentando a percepção de valor do paciente e organizando melhor o acompanhamento.**

Se essa hipótese for validada, avançamos para inteligência biomecânica mais sofisticada.

Se essa hipótese não for validada, não adianta construir Motion AI, Digital Twin ou IA prescritiva. Seria colocar teto solar em submarino.

---

## 3. Promessa do MVP

A promessa do MVP será:

**“Transforme sua avaliação de Pilates em um relatório clínico visual, moderno e evolutivo em poucos minutos.”**

Essa promessa deve guiar todas as telas, funções e decisões.

---

## 4. Usuário-Alvo do MVP

O MVP será construído para:

1. Fisioterapeutas que atuam com Pilates clínico.
2. Donos de clínicas ou estúdios de Pilates.
3. Profissionais que realizam avaliações, reavaliações e prescrição de exercícios.
4. Clínicas que desejam melhorar a experiência do paciente e diferenciar seu serviço.

O MVP não será construído inicialmente para:

- Paciente final.
- Grandes redes.
- Franquias.
- Academias genéricas.
- Médicos.
- Operadoras de saúde.
- Marketplace de serviços.

---

## 5. Escopo Central

O MVP terá cinco módulos principais:

1. Autenticação e clínica.
2. Pacientes/alunos.
3. Avaliações.
4. Relatórios.
5. Histórico evolutivo.

Tudo que não apoiar diretamente esses cinco módulos será tratado como backlog futuro.

---

# 6. O que entra no MVP 1.0

## 6.1 Autenticação

### Funcionalidades

- Cadastro de usuário.
- Login com e-mail e senha.
- Logout.
- Proteção de rotas internas.
- Redirecionamento de usuário não autenticado para tela de login.

### Critérios de aceite

- O usuário consegue criar uma conta.
- O usuário consegue entrar no sistema.
- O usuário consegue sair do sistema.
- Usuários não logados não acessam áreas internas.
- O sistema reconhece o usuário ativo.

---

## 6.2 Clínica

### Funcionalidades

- Criação automática ou manual de clínica.
- Vínculo do usuário à clínica.
- Dados básicos da clínica:
  - Nome da clínica.
  - Nome do responsável.
  - E-mail.
  - Telefone.
  - Cidade.
  - Estado.
  - Logo opcional.

### Critérios de aceite

- Todo usuário precisa estar vinculado a uma clínica.
- Toda informação clínica precisa pertencer a uma clínica.
- Um usuário não pode acessar dados de outra clínica.
- O sistema deve permitir identificação visual básica da clínica no relatório.

---

## 6.3 Pacientes/Alunos

### Funcionalidades

- Criar paciente/aluno.
- Listar pacientes/alunos.
- Editar dados básicos.
- Abrir perfil do paciente.
- Visualizar histórico de avaliações.
- Excluir ou arquivar paciente.

### Campos mínimos

- Nome completo.
- Data de nascimento ou idade.
- Sexo.
- Telefone.
- E-mail opcional.
- Objetivo principal.
- Queixa principal.
- Observações clínicas.
- Status: ativo, inativo ou arquivado.

### Critérios de aceite

- O usuário consegue cadastrar paciente.
- O paciente aparece na listagem.
- O usuário consegue abrir o perfil do paciente.
- O usuário consegue editar informações.
- O usuário consegue ver avaliações vinculadas ao paciente.
- Pacientes de uma clínica não aparecem para outra clínica.

---

## 6.4 Avaliações

### Funcionalidades

- Criar nova avaliação.
- Escolher paciente.
- Escolher tipo de avaliação.
- Registrar dados clínicos básicos.
- Salvar avaliação como rascunho.
- Finalizar avaliação.
- Vincular avaliação ao paciente e à clínica.

### Tipos de avaliação no MVP

O MVP terá três tipos simples:

1. Avaliação postural estática.
2. Avaliação dinâmica simples.
3. Avaliação por exercício de Pilates.

### Campos clínicos mínimos

- Data da avaliação.
- Profissional responsável.
- Objetivo da avaliação.
- Queixa principal.
- Dor atual, quando aplicável.
- Observações gerais.
- Achados relevantes.
- Conduta sugerida.
- Recomendações.
- Status da avaliação:
  - Rascunho.
  - Em revisão.
  - Finalizada.

### Critérios de aceite

- O usuário consegue criar avaliação.
- A avaliação fica vinculada ao paciente.
- A avaliação fica vinculada à clínica.
- O usuário consegue salvar e continuar depois.
- O usuário consegue finalizar avaliação.
- O usuário consegue usar a avaliação para gerar relatório.

---

## 6.5 Avaliação Postural Estática

### Funcionalidades

- Upload ou captura de imagem.
- Seleção da vista:
  - Anterior.
  - Posterior.
  - Lateral direita.
  - Lateral esquerda.
- Registro manual de achados.
- Campo para observações profissionais.
- Score simples opcional.
- Salvamento da imagem no histórico.

### Achados sugeridos

O sistema poderá permitir seleção manual de achados como:

- Assimetria de ombros.
- Assimetria pélvica.
- Anteriorização de cabeça.
- Alteração de alinhamento de joelhos.
- Alteração de apoio dos pés.
- Alteração de curvaturas.
- Compensações posturais observáveis.

### Critérios de aceite

- O usuário consegue adicionar imagem.
- O usuário consegue registrar achados.
- O usuário consegue salvar a avaliação postural.
- Os achados aparecem no relatório.
- A linguagem deve ser prudente e não diagnóstica.

---

## 6.6 Avaliação Dinâmica Simples

### Funcionalidades

- Upload ou captura de vídeo.
- Escolha do movimento avaliado.
- Registro manual de compensações.
- Registro de observações clínicas.
- Score simples opcional.
- Salvamento do vídeo ou referência no histórico.

### Movimentos iniciais

O MVP pode começar com:

1. Agachamento.
2. Flexão de tronco.
3. Elevação de membros superiores.
4. Ponte.
5. Movimento livre observado pelo profissional.

### Compensações sugeridas

- Valgo dinâmico.
- Assimetria de descarga de peso.
- Instabilidade pélvica.
- Compensação lombar.
- Compensação cervical.
- Perda de controle motor.
- Redução de amplitude.
- Dor durante movimento.

### Critérios de aceite

- O usuário consegue registrar avaliação dinâmica.
- O usuário consegue associar vídeo à avaliação.
- O usuário consegue inserir achados.
- Os achados aparecem no relatório.
- O sistema deixa claro que a análise depende de confirmação profissional.

---

## 6.7 Avaliação por Exercício de Pilates

### Funcionalidades

- Seleção de exercício avaliado.
- Registro de execução.
- Registro de compensações.
- Classificação de controle.
- Observações clínicas.
- Sugestão manual de progressão ou regressão.

### Exercícios iniciais sugeridos

- Hundred.
- Roll Up.
- Single Leg Stretch.
- Bridge.
- Swan.
- Side Kick.
- Squat no Reformer.
- Footwork no Reformer.

### Critérios de aceite

- O usuário consegue escolher exercício.
- O usuário consegue registrar achados.
- O usuário consegue salvar observações.
- O conteúdo entra no relatório.

---

## 6.8 Relatórios

### Funcionalidades

- Gerar relatório a partir de avaliação.
- Editar conteúdo antes de finalizar.
- Inserir dados da clínica.
- Inserir dados do paciente.
- Inserir resumo da avaliação.
- Inserir achados posturais.
- Inserir achados dinâmicos.
- Inserir recomendações.
- Inserir plano sugerido.
- Salvar relatório.
- Exportar PDF simples.

### Estrutura mínima do relatório

1. Cabeçalho com marca da clínica.
2. Dados do paciente.
3. Dados da avaliação.
4. Objetivo da avaliação.
5. Resumo clínico.
6. Achados posturais.
7. Achados dinâmicos.
8. Exercícios avaliados.
9. Recomendações.
10. Plano inicial.
11. Observações do profissional.
12. Disclaimer clínico.

### Disclaimer obrigatório

Todo relatório deve conter:

**“Este relatório tem finalidade de apoio à decisão profissional e acompanhamento evolutivo. Não substitui avaliação clínica presencial, diagnóstico médico ou julgamento profissional do fisioterapeuta responsável.”**

### Critérios de aceite

- O relatório é gerado a partir da avaliação.
- O profissional consegue editar antes de finalizar.
- O relatório fica salvo.
- O relatório pode ser visualizado depois.
- O relatório pode ser exportado em PDF.
- O relatório tem aparência profissional e premium.

---

## 6.9 Histórico Evolutivo

### Funcionalidades

- Listar avaliações anteriores do paciente.
- Listar relatórios anteriores.
- Visualizar evolução por data.
- Comparar avaliações de forma simples.

### Comparação inicial

No MVP, a comparação pode ser básica:

- Data da avaliação.
- Tipo de avaliação.
- Score geral, se houver.
- Principais achados.
- Recomendações anteriores.
- Observações de evolução.

### Critérios de aceite

- O usuário consegue ver avaliações anteriores.
- O usuário consegue abrir relatórios anteriores.
- O histórico fica vinculado ao paciente.
- O histórico não mistura dados de pacientes diferentes.

---

# 7. O que não entra no MVP 1.0

Ficam fora do MVP:

## 7.1 Inteligência avançada

- IA diagnóstica.
- Prescrição automática completa.
- Digital Twin.
- Motion AI em tempo real.
- Correção automática de exercício.
- Predição de risco.
- Comparação com banco populacional.
- Classificação automática complexa.

## 7.2 Gestão completa

- Agenda.
- Financeiro.
- Controle de pagamento.
- Controle de planos.
- CRM.
- Funil de vendas.
- Mensageria automática.
- WhatsApp integrado.
- Controle de equipe avançado.

## 7.3 Plataforma ampliada

- Marketplace.
- Comunidade.
- IA Store.
- Product Store.
- Academy integrada.
- Aplicativo do paciente.
- App mobile nativo.
- Wearables.
- Integrações com prontuários externos.

## 7.4 Biblioteca extensa

- Centenas de exercícios.
- Protocolos completos.
- Trilhas terapêuticas automáticas.
- Conteúdo educacional para pacientes.
- Vídeos demonstrativos próprios.

Essas funções podem ser excelentes no futuro. No MVP, são excesso de bagagem.

---

# 8. Stack Técnica do MVP

## 8.1 Frontend

- Lovable.
- React.
- TypeScript.
- TanStack.
- Tailwind.
- shadcn/ui.

## 8.2 Backend e Dados

- Supabase Auth.
- Supabase Database.
- Supabase Storage.
- Row Level Security por clínica.

## 8.3 Motor Biomecânico

No MVP 1.0, o motor biomecânico pode estar em uma das três condições:

### Nível 1 — Manual estruturado

O profissional registra achados manualmente.

### Nível 2 — Semiautomático

O sistema sugere campos e organiza achados.

### Nível 3 — API Python inicial

FastAPI recebe imagem ou vídeo e retorna métricas simples.

O MVP pode ser lançado no Nível 1 ou 2, desde que entregue relatório premium e histórico seguro.

---

# 9. Modelo de Dados Mínimo

## 9.1 Tabelas essenciais

- `clinics`
- `profiles`
- `students`
- `assessments`
- `postural_results`
- `movement_results`
- `exercise_results`
- `reports`

## 9.2 Campos mínimos por tabela

### clinics

- id
- name
- owner_id
- email
- phone
- city
- state
- logo_url
- created_at

### profiles

- id
- user_id
- clinic_id
- full_name
- role
- created_at

### students

- id
- clinic_id
- name
- birth_date
- sex
- phone
- email
- main_goal
- main_complaint
- notes
- status
- created_at

### assessments

- id
- clinic_id
- student_id
- professional_id
- type
- title
- objective
- main_complaint
- pain_score
- clinical_notes
- status
- created_at
- finalized_at

### postural_results

- id
- clinic_id
- assessment_id
- student_id
- view
- image_url
- findings
- score
- professional_notes
- created_at

### movement_results

- id
- clinic_id
- assessment_id
- student_id
- movement_name
- video_url
- compensations
- score
- professional_notes
- created_at

### exercise_results

- id
- clinic_id
- assessment_id
- student_id
- exercise_name
- execution_notes
- compensations
- control_level
- recommendation
- created_at

### reports

- id
- clinic_id
- student_id
- assessment_id
- title
- content
- pdf_url
- status
- version
- created_at
- finalized_at

---

# 10. Segurança Obrigatória

## 10.1 Regras mínimas

- Todo dado clínico deve ter `clinic_id`.
- Todo usuário deve estar vinculado a uma clínica.
- RLS deve impedir acesso cruzado.
- Storage deve proteger imagens, vídeos e PDFs.
- Chaves sensíveis não podem ir para o frontend.
- Relatórios só podem ser acessados por usuários autorizados.
- O sistema deve ter política de privacidade básica.

## 10.2 Critério de pronto em segurança

O MVP só pode ser testado com pacientes reais quando:

1. RLS estiver ativa.
2. Usuário A não conseguir ver dados da clínica B.
3. Imagens e PDFs não estiverem públicos sem controle.
4. O relatório tiver disclaimer clínico.
5. Existir consentimento ou orientação de uso de imagem/vídeo.

---

# 11. Jornada Principal do Usuário

## Jornada 1 — Primeiro acesso

1. Usuário cria conta.
2. Sistema cria perfil.
3. Usuário cria ou confirma clínica.
4. Usuário entra no dashboard.

## Jornada 2 — Cadastro de paciente

1. Usuário acessa Pacientes.
2. Clica em Novo Paciente.
3. Preenche dados básicos.
4. Salva cadastro.
5. Abre perfil do paciente.

## Jornada 3 — Nova avaliação

1. Usuário abre paciente.
2. Clica em Nova Avaliação.
3. Escolhe tipo.
4. Preenche dados clínicos.
5. Adiciona imagem, vídeo ou achados.
6. Salva avaliação.

## Jornada 4 — Relatório

1. Usuário finaliza avaliação.
2. Clica em Gerar Relatório.
3. Sistema monta relatório.
4. Usuário revisa.
5. Usuário finaliza.
6. Sistema salva no histórico.
7. Usuário exporta PDF.

## Jornada 5 — Evolução

1. Usuário abre paciente.
2. Visualiza avaliações anteriores.
3. Abre relatórios.
4. Compara evolução clínica.

---

# 12. Definition of Done do MVP

Uma funcionalidade só será considerada pronta quando:

1. Estiver implementada.
2. Não quebrar rotas existentes.
3. Estiver conectada ao Supabase quando aplicável.
4. Respeitar `clinic_id`.
5. Tiver tratamento básico de erro.
6. Tiver interface compreensível.
7. Tiver linguagem clínica prudente.
8. Funcionar em desktop.
9. Passar em build.
10. Estiver alinhada ao objetivo do MVP.

---

# 13. Critérios de Sucesso do MVP

## 13.1 Produto

- 3 clínicas ou profissionais testando.
- 20 pacientes cadastrados.
- 30 avaliações criadas.
- 20 relatórios gerados.
- Tempo médio para gerar relatório abaixo de 10 minutos.

## 13.2 Experiência

- Usuário entende o fluxo sem treinamento longo.
- Relatório é percebido como profissional.
- Usuário consegue explicar valor ao paciente.
- Usuário deseja usar em nova avaliação.

## 13.3 Comercial

- Pelo menos 1 piloto pago.
- Pelo menos 3 conversas comerciais qualificadas.
- Faixa de preço inicial validada.
- Lista clara de objeções de compra.

## 13.4 Técnico

- Login funcionando.
- CRUD de pacientes funcionando.
- Avaliações salvas.
- Relatórios salvos.
- RLS validado.
- Build sem erro.

---

# 14. Ordem de Execução

## Sprint 1 — Fundação SaaS

Objetivo: autenticação, clínica, usuário e segurança inicial.

Entregas:

- Login.
- Cadastro.
- Logout.
- Perfil.
- Clínica.
- Rotas protegidas.
- RLS inicial.

## Sprint 2 — Pacientes

Objetivo: criar base clínica real.

Entregas:

- Criar paciente.
- Listar pacientes.
- Editar paciente.
- Perfil do paciente.
- Arquivar paciente.

## Sprint 3 — Avaliações

Objetivo: registrar avaliação clínica estruturada.

Entregas:

- Nova avaliação.
- Tipos de avaliação.
- Campos clínicos.
- Upload de imagem ou vídeo.
- Salvar avaliação.
- Finalizar avaliação.

## Sprint 4 — Relatórios

Objetivo: transformar avaliação em valor percebido.

Entregas:

- Gerar relatório.
- Editar relatório.
- Finalizar relatório.
- Salvar histórico.
- Exportar PDF.

## Sprint 5 — Evolução e Piloto

Objetivo: testar com usuários reais.

Entregas:

- Histórico evolutivo.
- Ajustes de UX.
- Correção de bugs.
- Teste com clínicas.
- Coleta de feedback.
- Validação comercial.

---

# 15. Backlog Priorizado

## P0 — Obrigatório para MVP

- Auth.
- Clínica.
- Perfil.
- RLS.
- Pacientes.
- Avaliações.
- Relatórios.
- Histórico.
- Exportação PDF.
- Disclaimer clínico.

## P1 — Importante para diferenciação

- Upload de imagem.
- Upload de vídeo.
- Templates de relatório.
- Logo da clínica.
- Score simples.
- Comparação evolutiva.
- Campos inteligentes de achados.

## P2 — Pós-MVP

- API Python.
- Análise postural automática.
- Análise dinâmica automática.
- Imagem anotada.
- Métricas biomecânicas.
- Prescrição orientada.
- Dashboard de indicadores.

## P3 — Futuro estratégico

- Motion AI.
- Digital Twin.
- IA prescritiva.
- Biblioteca avançada de exercícios.
- Integrações.
- App do paciente.
- Marketplace.
- Academy.

---

# 16. Regras de Proteção de Escopo

A partir deste documento, qualquer nova ideia deve passar por três perguntas:

1. Isso ajuda a cadastrar paciente, fazer avaliação ou gerar relatório?
2. Isso é necessário para validar venda?
3. Isso cabe nas próximas 6 semanas?

Se a resposta for “não” para duas ou mais perguntas, a ideia vai para o backlog futuro.

---

# 17. Não Negociáveis

O MVP não pode ser lançado sem:

1. Login funcionando.
2. Clínica vinculada.
3. Paciente cadastrado.
4. Avaliação criada.
5. Relatório gerado.
6. Dados separados por clínica.
7. Linguagem clínica prudente.
8. Histórico do paciente.
9. Build funcionando.
10. Teste com usuário real.

---

# 18. Entrega Final Esperada

Ao final do MVP 1.0, o PilatesVision deve permitir que um fisioterapeuta faça o seguinte fluxo sem ajuda técnica:

**Entrar no sistema → cadastrar paciente → criar avaliação → registrar achados → gerar relatório premium → salvar no histórico → exportar PDF.**

Se esse fluxo funcionar bem, temos produto.

Se esse fluxo não funcionar, todo o resto é decoração cara.

---

# 19. Decisão Executiva

O PilatesVision MVP 1.0 será um produto de avaliação e relatório evolutivo.

A visão computacional avançada será tratada como camada progressiva, não como condição inicial para lançamento.

A prioridade absoluta será gerar valor clínico e comercial rapidamente.

---

# 20. Frase de Foco

**Primeiro relatório vendido. Depois inteligência expandida.**

Esse é o foco do MVP.
