# PilatesVision — Product Charter

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Categoria:** SaaS clínico para avaliação, acompanhamento e relatórios em Pilates  
**Product Owner:** Prof. Dr. Rodrigo Della Méa Plentz  
**Status:** Documento-base para reorganização do projeto

---

## 1. Visão do Produto

O PilatesVision será uma plataforma SaaS clínica para estúdios, clínicas de Pilates e fisioterapeutas que desejam transformar a avaliação tradicional em uma experiência digital, visual, padronizada e evolutiva.

A plataforma deve ajudar o profissional a avaliar melhor, acompanhar evolução com mais clareza, gerar relatórios premium e aumentar a percepção de valor do paciente.

O PilatesVision não nasce para substituir o fisioterapeuta. Nasce para dar superpoderes ao fisioterapeuta.

---

## 2. Missão

Padronizar, qualificar e modernizar a avaliação no Pilates clínico por meio de tecnologia, visão computacional, dados estruturados e relatórios evolutivos de apoio à decisão profissional.

---

## 3. Problema Central

Clínicas e estúdios de Pilates frequentemente realizam avaliações de forma manual, pouco padronizada, com baixa documentação visual e dificuldade para demonstrar evolução ao paciente.

Isso gera quatro problemas:

1. Baixa percepção de valor pelo paciente.
2. Pouca padronização entre profissionais.
3. Dificuldade de acompanhar evolução objetiva.
4. Perda de oportunidade comercial na venda de planos, reavaliações e acompanhamento premium.

---

## 4. Proposta de Valor

O PilatesVision permite que o profissional cadastre o paciente, realize uma avaliação postural e funcional, registre imagens ou vídeos, organize achados clínicos e gere um relatório visual premium em poucos minutos.

A promessa principal do MVP é:

**“Transforme sua avaliação de Pilates em um relatório clínico visual, moderno e evolutivo.”**

---

## 5. Público-Alvo Inicial

### Público principal

Fisioterapeutas e clínicas de Pilates que trabalham com avaliação, reavaliação, prescrição de exercícios e acompanhamento evolutivo.

### Público secundário

Estúdios de Pilates com foco em qualidade, diferenciação, tecnologia e experiência premium para o aluno/paciente.

### Público futuro

Redes de clínicas, franquias de Pilates, escolas de formação, serviços de fisioterapia, academias terapêuticas e plataformas de saúde digital.

---

## 6. Persona Principal

### Fisioterapeuta dono ou gestor de clínica de Pilates

**Dores:**

- Quer diferenciar sua clínica.
- Sente dificuldade em mostrar evolução ao paciente.
- Usa avaliações pouco padronizadas.
- Precisa justificar planos terapêuticos.
- Quer parecer mais moderno e profissional.
- Não tem tempo para relatórios longos.

**Desejos:**

- Avaliar com mais segurança.
- Gerar relatórios bonitos.
- Aumentar valor percebido.
- Fidelizar pacientes.
- Organizar histórico clínico.
- Usar tecnologia sem complicação.

---

## 7. Posicionamento

O PilatesVision será posicionado como:

**Plataforma de avaliação inteligente e relatório evolutivo para Pilates clínico.**

Não será posicionado como:

- Prontuário eletrônico completo.
- IA diagnóstica.
- Sistema de gestão financeira.
- Aplicativo genérico de exercícios.
- Marketplace.
- Substituto do fisioterapeuta.
- Sistema de prescrição automática independente.

---

## 8. Produto MVP 1.0

O MVP 1.0 terá um foco único:

**Permitir que uma clínica cadastre pacientes, realize avaliações simples e gere relatórios evolutivos premium.**

### Funcionalidades obrigatórias

1. Login e cadastro de usuário.
2. Criação ou vínculo com clínica.
3. Cadastro de paciente/aluno.
4. Criação de avaliação.
5. Registro de avaliação postural estática.
6. Registro de avaliação dinâmica simples.
7. Campos clínicos editáveis pelo profissional.
8. Relatório visual premium.
9. Histórico evolutivo do paciente.
10. Segurança por clínica com controle de acesso.

---

## 9. O que não entra no MVP 1.0

Para proteger o foco, ficam fora do MVP:

- Digital Twin completo.
- IA diagnóstica.
- Correção em tempo real.
- Marketplace.
- Agenda completa.
- Financeiro.
- Biblioteca gigante de exercícios.
- Integração com wearables.
- Prescrição automática avançada.
- Gamificação.
- Comparação normativa populacional.
- Rede social ou comunidade.
- Aplicativo para paciente final.

Esses itens podem voltar em versões futuras. No MVP, são distração elegante. E distração elegante ainda é distração.

---

## 10. Princípios Clínicos

O PilatesVision deve seguir quatro princípios clínicos:

1. **Apoio à decisão profissional**  
   O sistema sugere, organiza e apresenta dados. O profissional decide.

2. **Linguagem prudente**  
   Usar termos como “sugere”, “indica”, “possível”, “necessita confirmação clínica”.

3. **Revisão obrigatória pelo profissional**  
   Todo resultado deve poder ser revisado, editado e confirmado antes de virar relatório.

4. **Não emitir diagnóstico automático**  
   O produto não deve afirmar diagnósticos fechados nem substituir exame clínico.

---

## 11. Princípios de Produto

O PilatesVision deve ser:

### Simples

O usuário precisa entender o fluxo sem treinamento longo.

### Clínico

A experiência deve parecer feita para fisioterapeutas, não para programadores em noite de café duvidoso.

### Visual

Imagens, gráficos, scores e evolução devem ser centrais.

### Premium

O relatório deve aumentar a percepção de valor do atendimento.

### Seguro

Dados clínicos precisam ser protegidos desde o primeiro dia.

### Escalável

A arquitetura deve permitir evolução para visão computacional, IA e módulos avançados sem reconstruir tudo.

---

## 12. Arquitetura Executiva

O projeto será organizado em três camadas:

### 1. Camada SaaS

Responsável por:

- Interface.
- Login.
- Dashboard.
- Cadastro.
- Fluxos clínicos.
- Relatórios.
- Experiência do usuário.

Tecnologias principais:

- Lovable.
- React.
- TanStack.
- TypeScript.
- Tailwind.
- shadcn/ui.

### 2. Camada de Dados

Responsável por:

- Autenticação.
- Banco de dados.
- Storage.
- Segurança.
- Multi-clínica.
- Histórico clínico.

Tecnologia principal:

- Supabase.

### 3. Camada Biomecânica

Responsável por:

- Análise de imagem.
- Análise de vídeo.
- MediaPipe.
- OpenCV.
- Métricas estruturadas.
- Imagens ou vídeos anotados.

Tecnologias principais:

- Python.
- FastAPI.
- MediaPipe.
- OpenCV.

---

## 13. Fluxo Principal do Produto

O fluxo central do MVP será:

1. Usuário faz login.
2. Seleciona ou cria paciente.
3. Cria nova avaliação.
4. Preenche dados clínicos básicos.
5. Registra avaliação postural ou dinâmica.
6. Sistema organiza achados.
7. Profissional revisa.
8. Sistema gera relatório premium.
9. Relatório fica salvo no histórico.
10. Profissional pode comparar evolução.

---

## 14. Métrica Norte

A principal métrica do PilatesVision MVP será:

**Número de relatórios clínicos gerados por clínicas ativas por mês.**

Essa métrica é melhor do que número de logins, número de telas ou número de cadastros, porque mede uso real e valor percebido.

---

## 15. Métricas de Sucesso do MVP

### Produto

- 3 clínicas ou profissionais testando.
- 20 pacientes cadastrados.
- 30 avaliações criadas.
- 20 relatórios gerados.
- Tempo médio para gerar relatório abaixo de 10 minutos.

### Valor percebido

- Pelo menos 70% dos usuários-teste consideram o relatório superior ao modelo atual.
- Pelo menos 50% dizem que usariam em rotina clínica.
- Pelo menos 30% aceitam pagar por piloto.

### Técnico

- Nenhuma rota essencial quebrada.
- Login funcionando.
- Dados persistidos no Supabase.
- RLS funcionando por clínica.
- Build sem erro.
- Relatórios salvos corretamente.

### Comercial

- Primeiro piloto pago.
- Validação de faixa de preço.
- Lista clara de objeções de compra.
- Identificação dos segmentos mais interessados.

---

## 16. Modelo Comercial Inicial

### Plano Solo

Para fisioterapeutas individuais.

Faixa sugerida:

**R$ 79 a R$ 129/mês**

### Plano Clínica

Para clínicas pequenas e médias.

Faixa sugerida:

**R$ 199 a R$ 399/mês**

### Piloto Premium

Para primeiras clínicas parceiras, com implantação assistida.

Faixa sugerida:

**R$ 497 a R$ 997/mês**

O piloto premium deve incluir acompanhamento próximo, coleta de feedback e melhoria contínua do produto.

---

## 17. Riscos Principais

### Risco 1 — Escopo infinito

O projeto pode tentar virar plataforma completa antes de validar o uso básico.

**Resposta:** manter MVP fechado.

### Risco 2 — Promessa clínica exagerada

O produto pode parecer diagnóstico automático.

**Resposta:** linguagem prudente e revisão profissional obrigatória.

### Risco 3 — Complexidade técnica da visão computacional

A análise de vídeo pode atrasar o produto.

**Resposta:** começar com relatório e avaliação estruturada; conectar motor biomecânico em fases.

### Risco 4 — Segurança insuficiente

Dados clínicos exigem cuidado.

**Resposta:** RLS, storage protegido, consentimento e política de privacidade desde o início.

### Risco 5 — Baixa disposição a pagar

Profissionais podem achar interessante, mas não pagar.

**Resposta:** validar preço com piloto real o quanto antes.

---

## 18. Critérios de Pronto para MVP 1.0

O PilatesVision MVP 1.0 estará pronto quando:

1. Um usuário conseguir criar conta.
2. Uma clínica for criada ou vinculada.
3. Um paciente puder ser cadastrado.
4. Uma avaliação puder ser criada.
5. Um relatório puder ser gerado.
6. O relatório puder ser salvo no histórico.
7. Os dados forem protegidos por clínica.
8. O profissional puder revisar o conteúdo antes de finalizar.
9. O sistema estiver estável para piloto.
10. Pelo menos uma clínica real conseguir usar sem ajuda direta do desenvolvedor.

---

## 19. Decisões Estratégicas

### Decisão 1

O PilatesVision será primeiro um SaaS de avaliação e relatório, não uma plataforma completa de gestão.

### Decisão 2

O motor biomecânico será separado da interface, usando Python/FastAPI.

### Decisão 3

O Supabase será a fonte única de dados.

### Decisão 4

O produto será multi-clínica desde o início.

### Decisão 5

Toda análise será apresentada como apoio à decisão profissional.

### Decisão 6

O relatório premium será o principal ativo comercial do MVP.

---

## 20. Frase de Alinhamento Interno

Sempre que surgir uma nova ideia, a equipe deve perguntar:

**“Isso ajuda uma clínica real a cadastrar um paciente, fazer uma avaliação e gerar um relatório melhor agora?”**

Se a resposta for não, vai para o backlog futuro.

---

## 21. Norte Executivo

Nos próximos 45 dias, o PilatesVision não deve tentar impressionar todo mundo.

Deve fazer uma coisa muito bem:

**Gerar avaliações e relatórios clínicos premium para Pilates com segurança, clareza e valor percebido.**

Esse é o caminho mais curto entre visão, produto e faturamento.
