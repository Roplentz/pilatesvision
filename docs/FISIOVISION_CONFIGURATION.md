# Configuração segura da integração FisioVision

A integração roda exclusivamente no servidor do PilatesVision. O bucket `clinical-media` permanece privado.

## Secrets obrigatórios

- `FISIOVISION_API_URL`: URL HTTPS da API do motor.
- `FISIOVISION_CONSUMER_ID=pilatesvision`.

### Autenticação recomendada: JWT de curta duração

Configure:

- `FISIOVISION_JWT_PRIVATE_KEY`: chave RSA privada PEM; pode usar quebras de linha ou `\\n`.
- `FISIOVISION_JWT_KEY_ID`: `kid` publicado no JWKS configurado no motor.
- `FISIOVISION_JWT_ISSUER`: igual a `FISIOVISION_JWT_ISSUER` do motor.
- `FISIOVISION_JWT_AUDIENCE`: igual a `FISIOVISION_JWT_AUDIENCE` do motor.
- `FISIOVISION_JWT_SUBJECT`: opcional, padrão `pilatesvision-service`.

O PilatesVision emite um JWT RS256 com validade de cinco minutos e claim `consumers: ["pilatesvision"]`.

### Compatibilidade temporária

`FISIOVISION_API_TOKEN` continua aceito como fallback para migração. O token precisa ser um JWT RS256 válido para o motor. Não é recomendado em produção por expirar sem renovação automática.

## Requisitos do motor

- JWKS público contendo a chave correspondente ao `kid`.
- API e worker usando a mesma tabela `fisiovision_analyses`.
- `FISIOVISION_VIDEO_HOSTS` contendo o host do Supabase Storage.
- API e worker ativos antes do teste ponta a ponta.

## Validações aplicadas

Antes de criar um job, o servidor confirma:

1. autenticação do usuário;
2. exercício pertencente à allowlist;
3. clínica do usuário;
4. correspondência entre clínica, paciente, avaliação e path;
5. existência do objeto;
6. MIME MP4, MOV ou WebM;
7. tamanho entre 1 byte e 50 MB;
8. URL HTTPS e resposta do motor dentro do timeout.

A chave de idempotência é um SHA-256 opaco, estável e menor que o limite de 128 caracteres da API.

## Checklist antes de produção

1. Executar `bun run ci`.
2. Confirmar que nenhum secret aparece no bundle do navegador.
3. Criar um vídeo de teste sem dados identificáveis.
4. Verificar transições `queued → processing → completed`.
5. Testar 400, 401, 403, 404, 429 e 503.
6. Confirmar limpeza/retention dos vídeos conforme consentimento e política clínica.
