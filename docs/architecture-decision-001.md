# Decisão arquitetural 001 Supabase

Status: aprovado.

O PilatesVision usará Supabase na primeira versão porque entrega banco PostgreSQL, autenticação, armazenamento privado e controle de acesso com alta velocidade de implantação.

Benefícios principais: MVP mais rápido, menor código próprio, boa integração com Python e possibilidade de evolução posterior.

Riscos: dependência da plataforma, necessidade de configuração cuidadosa de acesso e possível aumento de custos com muitas imagens e vídeos.

Mitigação: SQL versionado no GitHub, arquitetura modular e revisão de segurança antes de uso clínico real.
