# PilatesVision — Sprint 5: Evolução, Piloto Clínico e Validação Comercial

**Versão:** 1.0  
**Data:** 05/07/2026  
**Produto:** PilatesVision App  
**Fase:** MVP 1.0  
**Sprint:** Sprint 5  
**Nome da Sprint:** Evolução, Piloto Clínico e Validação Comercial  
**Responsável estratégico:** Prof. Dr. Rodrigo Della Méa Plentz

---

## 1. Objetivo da Sprint

A Sprint 5 tem como objetivo validar o PilatesVision em uso real com profissionais, clínicas ou estúdios de Pilates.

Ao final desta sprint, o sistema deve permitir:

**Profissional real → cadastra paciente → cria avaliação → gera relatório → exporta PDF → usa com paciente real → fornece feedback → valida valor percebido e disposição a pagar.**

Esta sprint não é para inventar novas funcionalidades.

É para descobrir se o produto que construímos resolve um problema real.

Produto sem usuário é tese.  
Produto com usuário reclamando é evolução.  
Produto com usuário pagando é negócio.

---

## 2. Resultado Esperado

Ao final da Sprint 5, o PilatesVision deve ter:

1. Fluxo completo testado ponta a ponta.
2. Pelo menos 3 profissionais ou clínicas em teste.
3. Pelo menos 20 pacientes cadastrados.
4. Pelo menos 30 avaliações criadas.
5. Pelo menos 20 relatórios gerados.
6. Pelo menos 10 PDFs exportados.
7. Feedback qualitativo coletado.
8. Bugs priorizados.
9. Objeções comerciais mapeadas.
10. Primeira proposta de preço validada.
11. Lista de melhorias para MVP 1.1.
12. Decisão executiva: avançar, ajustar ou reposicionar.

---

## 3. Escopo da Sprint

### Entra na Sprint 5

- Teste completo do fluxo Paciente → Avaliação → Relatório → PDF.
- Ajustes de UX essenciais.
- Correção de bugs críticos.
- Histórico evolutivo simples.
- Tela ou rotina de feedback.
- Painel mínimo de métricas do MVP.
- Coleta de feedback dos usuários-piloto.
- Validação de preço.
- Criação de roteiro de demonstração.
- Criação de checklist de implantação.
- Preparação do MVP 1.1.

### Não entra na Sprint 5

- Novos módulos grandes.
- API Python.
- IA avançada.
- Motion AI.
- Digital Twin.
- Marketplace.
- App do paciente.
- WhatsApp.
- Agenda.
- Financeiro.
- Biblioteca gigante de exercícios.
- Reescrever design inteiro.
- Mudar arquitetura.

Sprint 5 é validação. Não é hora de trocar o motor do avião em pleno voo.

---

## 4. Prioridade Estratégica

A prioridade absoluta desta sprint é:

**Provar que o PilatesVision gera valor real para profissionais e pacientes.**

Valor real significa:

- O profissional entende o fluxo.
- O profissional consegue usar sem ajuda constante.
- O relatório impressiona positivamente.
- O paciente percebe diferença.
- A clínica vê potencial de diferenciação.
- Existe disposição a pagar.

---

## 5. Fluxo de Valor Validado

O fluxo central que deve ser testado é:

1. Login.
2. Cadastro de clínica.
3. Cadastro de paciente.
4. Criação de avaliação.
5. Registro de achados.
6. Finalização da avaliação.
7. Geração de relatório.
8. Revisão do relatório.
9. Exportação PDF.
10. Uso do relatório com paciente.
11. Coleta de feedback.

Esse é o fluxo vendável do MVP.

Se isso funciona, temos produto.

Se isso não funciona, todo o resto é PowerPoint com cafeína.

---

## 6. Métrica Norte da Sprint

A métrica principal da Sprint 5 será:

**Número de relatórios clínicos gerados e usados em contexto real.**

Não é login.

Não é número de telas.

Não é quantidade de botões bonitos.

É relatório usado.

---

## 7. Métricas de Sucesso

### 7.1 Produto

- 3 profissionais ou clínicas testando.
- 20 pacientes cadastrados.
- 30 avaliações criadas.
- 20 relatórios gerados.
- 10 PDFs exportados.
- Tempo médio para gerar relatório abaixo de 10 minutos.

### 7.2 Experiência

- Pelo menos 70% dos usuários consideram o relatório melhor que o método atual.
- Pelo menos 60% entendem o fluxo sem treinamento longo.
- Pelo menos 50% dizem que usariam em rotina clínica.
- Pelo menos 30% aceitam participar de piloto pago.

### 7.3 Comercial

- Pelo menos 3 conversas comerciais qualificadas.
- Pelo menos 1 proposta de piloto pago enviada.
- Pelo menos 1 hipótese de preço testada.
- Principais objeções registradas.

### 7.4 Técnico

- Fluxo completo sem erro crítico.
- RLS validado.
- PDF exportando.
- Dados persistindo corretamente.
- Build sem erro.
- Bugs críticos corrigidos.

---

## 8. Usuários-Piloto

### Perfil ideal

Selecionar profissionais ou clínicas com:

- Atuação em Pilates clínico.
- Interesse em inovação.
- Capacidade de dar feedback.
- Rotina real de avaliação.
- Potencial de pagar.
- Boa relação com o projeto.

### Quantidade inicial

Começar com:

```txt
3 usuários-piloto
```

Evitar abrir para muita gente cedo demais.

Usuário demais em produto imaturo vira tsunami de opinião. E opinião sem priorização afoga projeto bom.

---

## 9. Critérios para Escolher Pilotos

Priorizar quem:

1. Faz avaliações na rotina.
2. Entrega ou gostaria de entregar relatórios.
3. Tem pacientes com acompanhamento longitudinal.
4. Valoriza diferenciação tecnológica.
5. Aceita testar produto em desenvolvimento.
6. Pode pagar se perceber valor.
7. Dá feedback direto e útil.

Evitar, neste momento:

- Usuários muito resistentes à tecnologia.
- Clínicas que querem solução completa de gestão.
- Pessoas que só querem usar gratuitamente sem retorno.
- Usuários que exigem customizações antes de testar.

---

## 10. Roteiro de Demonstração

A demonstração do PilatesVision deve seguir este roteiro:

### Etapa 1 — Problema

Mostrar que avaliações manuais são pouco padronizadas, difíceis de comparar e pouco visuais.

### Etapa 2 — Solução

Apresentar o PilatesVision como plataforma de avaliação e relatório evolutivo para Pilates clínico.

### Etapa 3 — Fluxo

Demonstrar:

1. Cadastro do paciente.
2. Nova avaliação.
3. Registro de achados.
4. Geração do relatório.
5. Exportação PDF.

### Etapa 4 — Valor

Reforçar:

- Ganho de tempo.
- Padronização.
- Percepção premium.
- Histórico evolutivo.
- Apoio à decisão profissional.

### Etapa 5 — Convite

Convidar para piloto:

```txt
Gostaria que você testasse com alguns pacientes reais e me dissesse: isso economiza tempo, melhora sua entrega e teria valor para sua clínica?
```

---

## 11. Checklist de Implantação do Piloto

Antes de cada piloto:

- [ ] Criar ou validar conta do usuário.
- [ ] Confirmar clínica vinculada.
- [ ] Explicar objetivo do MVP.
- [ ] Explicar que não é diagnóstico automático.
- [ ] Demonstrar fluxo completo.
- [ ] Orientar uso com 3 a 5 pacientes.
- [ ] Solicitar feedback após uso.
- [ ] Registrar dúvidas e objeções.
- [ ] Registrar tempo de uso.
- [ ] Registrar se o relatório foi entregue ao paciente.

---

## 12. Feedback Estruturado

Coletar feedback em cinco dimensões:

### 12.1 Facilidade de uso

Perguntas:

- O fluxo foi fácil de entender?
- Em qual tela você travou?
- O que ficou confuso?
- O cadastro foi rápido?

### 12.2 Valor clínico

Perguntas:

- A avaliação ficou melhor organizada?
- O relatório ajuda na tomada de decisão?
- Os campos clínicos fazem sentido?
- Faltou algum achado importante?

### 12.3 Valor para o paciente

Perguntas:

- O paciente entenderia melhor sua evolução?
- O relatório aumenta percepção de profissionalismo?
- Você entregaria esse PDF ao paciente?
- O paciente pagaria mais por uma avaliação assim?

### 12.4 Valor comercial

Perguntas:

- Você pagaria por isso?
- Quanto pagaria por mês?
- Usaria em todos os pacientes ou apenas em avaliações premium?
- Esse recurso ajudaria a vender planos?

### 12.5 Melhorias prioritárias

Perguntas:

- O que precisa melhorar antes de você usar de verdade?
- Qual função faltou?
- O que é desnecessário?
- O que deveria ser simplificado?

---

## 13. Formulário de Feedback Sugerido

### Nota de 0 a 10

1. Facilidade de uso.
2. Qualidade do relatório.
3. Utilidade clínica.
4. Valor percebido pelo paciente.
5. Chance de pagar pelo sistema.
6. Chance de indicar para outro profissional.

### Perguntas abertas

1. O que mais gostou?
2. O que mais incomodou?
3. O que falta para usar na rotina?
4. Quanto pagaria por mês?
5. Usaria em qual tipo de paciente?
6. Que frase você usaria para explicar o PilatesVision a outro profissional?

---

## 14. Ajustes de UX Permitidos

Durante a Sprint 5, são permitidos ajustes pequenos e essenciais:

- Melhorar textos de botões.
- Melhorar mensagens de erro.
- Reduzir campos desnecessários.
- Melhorar navegação entre paciente, avaliação e relatório.
- Corrigir estados vazios.
- Melhorar legibilidade do relatório.
- Ajustar layout do PDF.
- Corrigir fluxo confuso.

Não são permitidos:

- Criar módulos novos.
- Reescrever design inteiro.
- Mudar arquitetura.
- Adicionar IA.
- Criar app mobile.
- Criar dashboard complexo.

Ajuste fino, sim. Reforma do prédio, não.

---

## 15. Histórico Evolutivo Simples

### Objetivo

Permitir que o profissional veja a evolução do paciente por avaliações e relatórios.

### Elementos mínimos

No perfil do paciente:

- Linha do tempo de avaliações.
- Linha do tempo de relatórios.
- Data.
- Tipo de avaliação.
- Status.
- Botão para abrir avaliação.
- Botão para abrir relatório.

### Comparação inicial

No MVP, a comparação pode ser simples:

- Avaliação anterior.
- Avaliação atual.
- Principais achados.
- Observações profissionais.

### Não entra ainda

- Gráficos avançados.
- Scores comparativos complexos.
- IA interpretando evolução.
- Benchmark populacional.

---

## 16. Painel Mínimo de Métricas

Criar ou preparar no dashboard:

- Total de pacientes.
- Total de avaliações.
- Total de relatórios.
- Relatórios gerados no mês.
- Últimas avaliações.
- Últimos relatórios.

### Critérios

- Dados reais.
- Filtrados por clínica.
- Sem mock falso.
- Carregamento simples.
- Interface limpa.

Mock falso em dashboard é igual termômetro desenhado: bonito, mas não mede nada.

---

## 17. Validação de Preço

Durante o piloto, testar três faixas:

### Plano Solo

```txt
R$ 79 a R$ 129/mês
```

### Plano Clínica

```txt
R$ 199 a R$ 399/mês
```

### Piloto Premium Assistido

```txt
R$ 497 a R$ 997/mês
```

### Pergunta-chave

```txt
Se esse sistema estivesse pronto e estável, qual plano faria sentido para sua realidade?
```

### Outra pergunta forte

```txt
Esse relatório ajudaria você a vender uma avaliação premium ou um plano de acompanhamento?
```

---

## 18. Objeções Comerciais Esperadas

Registrar objeções como:

- “Achei caro.”
- “Preciso testar mais.”
- “Já uso prontuário.”
- “Meus pacientes não valorizam relatório.”
- “Tenho pouco tempo.”
- “Quero algo no celular.”
- “Preciso de WhatsApp.”
- “Quero IA automática.”
- “Quero agenda e financeiro junto.”

### Como interpretar

Nem toda objeção exige nova funcionalidade.

Às vezes a resposta é posicionamento.

Às vezes é preço.

Às vezes é treinamento.

Às vezes é só medo de mudar. Software não resolve terapia ocupacional do comportamento humano. Ainda.

---

## 19. Classificação dos Feedbacks

Classificar feedbacks em quatro grupos:

### P0 — Bloqueador

Impede uso real.

Exemplos:

- Login falha.
- Paciente não salva.
- Relatório não gera.
- PDF não exporta.
- Dados aparecem errados.

### P1 — Importante

Afeta valor percebido, mas não bloqueia.

Exemplos:

- Relatório pouco bonito.
- Campo clínico faltando.
- Fluxo confuso.
- Texto ruim.

### P2 — Melhoria

Boa ideia, mas pode esperar.

Exemplos:

- Mais templates.
- Gráficos melhores.
- Logo customizado.
- Comparação visual.

### P3 — Futuro

Fora do MVP.

Exemplos:

- IA automática.
- Motion AI.
- Digital Twin.
- Marketplace.
- App do paciente.

---

## 20. Critérios de Aceite da Sprint

A Sprint 5 será considerada concluída quando:

1. Fluxo completo Paciente → Avaliação → Relatório → PDF estiver funcionando.
2. Pelo menos 3 usuários-piloto testarem.
3. Pelo menos 20 pacientes forem cadastrados.
4. Pelo menos 30 avaliações forem criadas.
5. Pelo menos 20 relatórios forem gerados.
6. Pelo menos 10 PDFs forem exportados.
7. Feedback estruturado for coletado.
8. Bugs críticos forem identificados.
9. Objeções comerciais forem registradas.
10. Pelo menos uma hipótese de preço for testada.
11. Decisão sobre MVP 1.1 for tomada.
12. Build rodar sem erro.

---

## 21. Definition of Done da Sprint 5

Uma entrega só será considerada pronta quando:

- Foi testada por usuário real.
- Tem feedback registrado.
- Tem impacto classificado.
- Bugs críticos foram priorizados.
- Métricas foram registradas.
- Fluxo principal continua funcionando.
- Dados continuam seguros por clínica.
- Build permanece funcional.
- Próxima decisão de produto está documentada.

---

## 22. Checklist Técnico

### Produto

- [ ] Testar fluxo completo.
- [ ] Corrigir bugs P0.
- [ ] Corrigir principais bugs P1.
- [ ] Melhorar textos críticos.
- [ ] Melhorar estados vazios.
- [ ] Melhorar navegação.
- [ ] Validar PDF.
- [ ] Validar histórico do paciente.

### Métricas

- [ ] Contar pacientes cadastrados.
- [ ] Contar avaliações criadas.
- [ ] Contar relatórios gerados.
- [ ] Contar PDFs exportados.
- [ ] Registrar usuários ativos.
- [ ] Registrar tempo médio de geração de relatório.

### Piloto

- [ ] Selecionar 3 usuários-piloto.
- [ ] Fazer demonstração.
- [ ] Orientar uso real.
- [ ] Coletar feedback.
- [ ] Registrar objeções.
- [ ] Testar preço.
- [ ] Definir próximos passos.

### Qualidade

- [ ] Testar RLS.
- [ ] Testar dados entre clínicas.
- [ ] Rodar lint.
- [ ] Rodar typecheck.
- [ ] Rodar build.
- [ ] Rodar CI.

---

## 23. Comando de Validação Local

Rodar:

```bash
bun run lint
bun run typecheck
bun run build
bun run ci
```

Sprint 5 não termina com build quebrado.

Se o app quebra na frente do piloto, o feedback vira autópsia.

---

## 24. Roteiro de Entrevista Pós-Teste

### Abertura

```txt
Quero entender sua experiência real, sem tentar defender o produto. Pode falar direto.
```

### Perguntas

1. O que você tentou fazer primeiro?
2. Onde ficou confuso?
3. O que funcionou bem?
4. O relatório ficou útil?
5. Você entregaria esse relatório ao paciente?
6. Esse relatório aumentaria percepção de valor?
7. Quanto tempo você levou para gerar?
8. O que faltou para usar na rotina?
9. Quanto pagaria por isso?
10. O que faria você indicar para outro profissional?

### Fechamento

```txt
Se eu corrigisse apenas uma coisa para você usar de verdade, qual seria?
```

Essa pergunta vale ouro.

---

## 25. Prompt para Lovable — Sprint 5

Use este prompt para execução controlada:

```txt
Estamos executando a Sprint 5 do PilatesVision MVP 1.0: Evolução, Piloto Clínico e Validação Comercial.

Objetivo:
Preparar o produto para teste real com usuários-piloto, garantindo que o fluxo Paciente → Avaliação → Relatório → PDF funcione de ponta a ponta.

Escopo:
1. Revisar o fluxo completo desde cadastro de paciente até exportação PDF.
2. Corrigir bugs críticos que impeçam o uso real.
3. Melhorar navegação entre paciente, avaliação e relatório.
4. Melhorar estados vazios e mensagens de erro.
5. Criar ou ajustar histórico simples no perfil do paciente com avaliações e relatórios.
6. Criar painel mínimo com métricas reais: total de pacientes, avaliações e relatórios da clínica.
7. Garantir que todos os dados respeitem clinic_id.
8. Garantir que RLS continue impedindo acesso cruzado.
9. Melhorar legibilidade visual do relatório e do PDF, sem redesenhar tudo.
10. Preparar o app para piloto com 3 profissionais ou clínicas.

Regras:
- Não implementar IA nesta etapa.
- Não implementar API Python.
- Não implementar Motion AI.
- Não implementar Digital Twin.
- Não implementar marketplace.
- Não implementar agenda.
- Não implementar financeiro.
- Não implementar app do paciente.
- Não reconstruir o app do zero.
- Corrigir e lapidar apenas o fluxo MVP.
- Manter TypeScript strict.
- Garantir build sem erro.
- Manter linguagem clínica prudente.
- Não emitir diagnóstico automático.

Critérios de aceite:
- Usuário cadastra paciente.
- Usuário cria avaliação.
- Usuário finaliza avaliação.
- Usuário gera relatório.
- Usuário exporta PDF.
- Histórico do paciente mostra avaliações e relatórios.
- Dashboard mostra métricas reais.
- Usuário não vê dados de outra clínica.
- Build sem erro.
```

---

## 26. Prompt para Lovable — Correção Pós-Piloto

Usar após receber feedback dos usuários:

```txt
Revise apenas os problemas identificados no piloto do PilatesVision MVP 1.0.

Objetivo:
Corrigir bugs e melhorar pontos críticos do fluxo Paciente → Avaliação → Relatório → PDF.

Não implemente novos módulos.
Não implemente IA.
Não implemente API Python.
Não implemente Motion AI.
Não implemente Digital Twin.
Não altere a arquitetura geral.
Não redesenhe o app inteiro.

Priorize:
1. Bugs que impedem uso real.
2. Problemas de navegação.
3. Falhas de salvamento.
4. Problemas no relatório.
5. Problemas no PDF.
6. Mensagens de erro ruins.
7. Confusão no fluxo.
8. Problemas de segurança por clínica.

Mantenha:
- TypeScript strict.
- Supabase como fonte única de dados.
- RLS por clínica.
- Linguagem clínica prudente.
- Build sem erro.

Corrija apenas o necessário para melhorar a experiência do MVP.
```

---

## 27. Riscos da Sprint

### Risco 1 — Feedback virar lista infinita

**Impacto:** perda de foco.  
**Prevenção:** classificar P0, P1, P2 e P3.

### Risco 2 — Usuário pedir sistema completo

**Impacto:** escopo explode.  
**Prevenção:** reforçar que é MVP de avaliação e relatório.

### Risco 3 — Produto falhar no piloto

**Impacto:** frustração inicial.  
**Prevenção:** testar internamente antes da demonstração.

### Risco 4 — Preço rejeitado

**Impacto:** necessidade de reposicionamento.  
**Prevenção:** testar valor antes de defender preço.

### Risco 5 — Encantar sem converter

**Impacto:** muitos elogios, zero dinheiro.  
**Prevenção:** perguntar diretamente sobre pagamento.

Elogio não paga servidor. Boleto é o maior revisor de roadmap.

---

## 28. Entrega Final da Sprint 5

A entrega final esperada é:

**Um MVP validado com usuários reais, métricas de uso, feedback estruturado, bugs priorizados e primeira hipótese comercial testada.**

Ao terminar esta sprint, o PilatesVision deve estar pronto para uma das três decisões:

1. **Avançar para MVP 1.1**
2. **Corrigir pontos críticos antes de vender**
3. **Reposicionar oferta e preço**

---

## 29. Decisão Executiva

A Sprint 5 não é uma sprint de criação.

É uma sprint de verdade.

Ela vai mostrar se o PilatesVision é apenas uma boa ideia ou se já é um produto com potencial comercial.

Aqui paramos de perguntar:

```txt
O que mais podemos construir?
```

E começamos a perguntar:

```txt
O que realmente faz alguém pagar?
```

---

## 30. Frase de Foco da Sprint

**Produto validado é produto usado, entendido e desejado.**

Essa é a regra.
