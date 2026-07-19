# Arquitetura do Motor Biomecânico — Híbrido Consentido (Local-first + Nuvem opt-in)

> **Status:** proposta de arquitetura (spec para implementação no Lovable).
> **Data:** 2026-07-13 · **Autor da concepção do motor:** Rodrigo Plentz.
> **Decisão de produto:** _híbrido consentido_ — motor local é o padrão; a nuvem
> (FisioVision) é um **modo opt-in explícito**, atrás de feature flag, e só acende
> com consentimento LGPD específico + DPA + política de retenção fechados.
> **Regra de ouro:** o caminho nuvem **nunca** é o default e **nunca** dispara sozinho.

---

## 1. Objetivo

Preservar o Motor Biomecânico MVP v1 (local, 100% no navegador, vídeo nunca sai do
dispositivo) como caminho padrão, e permitir — quando o exercício não for coberto
localmente — o uso da análise em nuvem do FisioVision **somente** sob consentimento
explícito. A UI e o relatório não devem precisar saber de onde veio o resultado: ambos
os motores entregam o **mesmo contrato de saída**.

## 2. Princípio central: um roteador, dois motores, um contrato

```
                         ┌─────────────────────────┐
   Exercício + vídeo  →  │   analysisEngine.ts     │  ← camada de decisão
                         │   (roteador)            │
                         └───────────┬─────────────┘
              cobertura local?       │        senão + portão OK?
                    ▼                │                 ▼
        ┌───────────────────┐       │       ┌───────────────────────┐
        │  Motor LOCAL      │       │       │  Motor NUVEM           │
        │  poseMetrics.ts   │       │       │  FisioVision (Edge Fn) │
        │  (MediaPipe WASM) │       │       │  server-only           │
        └─────────┬─────────┘       │       └───────────┬───────────┘
                  ▼                 ▼                    ▼
                 ┌──────────────────────────────────────────┐
                 │  BiomechResult (schema normalizado único) │
                 └──────────────────────────────────────────┘
                              ▼
                    UI / Relatório / PDF
```

- **Local (padrão, sem consentimento extra):** agachamento → `poseMetrics.ts` no
  navegador. Vídeo nunca sai. É o caminho atual do MVP v1.
- **Nuvem (opt-in):** exercícios de Pilates não cobertos localmente → FisioVision, e
  **apenas** se as 3 condições do portão (§4) forem verdadeiras ao mesmo tempo.

## 3. Contrato de saída normalizado (`BiomechResult`)

Ambos os motores devem produzir este formato. Campos específicos de um exercício vão
em `metrics` (livre por tipo); o envelope é fixo.

```ts
// src/lib/biomech/types.ts
export type EngineSource = "local" | "cloud";

export interface BiomechResult {
  schemaVersion: "biomech-hybrid-v1";
  source: EngineSource; // "local" | "cloud"
  exerciseId: string; // ex.: "squat", "pilates-the-hundred"
  modelVersion: string; // versão do motor/modelo que gerou
  createdAt: string; // ISO
  quality: {
    totalFrames: number;
    validFrames: number;
    validRate: number; // 0..1
    confidence: number; // 0..1
  };
  reps: BiomechRep[]; // vazio se não aplicável
  summary: Record<string, number>; // medianas/P5/P95 robustas (sem NaN/Infinity)
  disclaimers: string[]; // "estimativa 2D; apoio à decisão; confirmar profissional"
  // rastreabilidade da nuvem (nulo no local):
  cloud?: { analysisId: string; consentId: string; provider: "fisiovision" } | null;
}

export interface BiomechRep {
  index: number;
  phases?: { descent?: number; bottom?: number; ascent?: number }; // segundos
  metrics: Record<string, number>; // por exercício
  confidence: number;
}
```

**Invariantes:** nunca retornar `NaN`/`Infinity`; sempre preencher `disclaimers`;
`source` obrigatório; no caminho nuvem, `cloud.consentId` obrigatório.

## 4. O portão de consentimento (as 3 condições)

Antes de gerar signed URL ou chamar o FisioVision, o roteador exige **as três**:

1. **Exercício fora da cobertura local** — se houver motor local para o exercício,
   roda local e ignora a nuvem.
2. **Consentimento LGPD específico "envio de vídeo à nuvem", por análise**, registrado
   (usuário, timestamp, versão do termo, finalidade). **Não** reutilizar o consentimento
   clínico geral — é finalidade nova (transferência a terceiro).
3. **DPA com o FisioVision assinado** + política de retenção definida (expiração no
   bucket `clinical-media` e no lado do FisioVision).

Se qualquer condição falhar: cair no local (se possível) ou **bloquear com motivo
explícito** ("análise em nuvem indisponível: consentimento pendente"). Nunca degradar
silenciosamente para a nuvem.

```ts
// src/lib/biomech/analysisEngine.ts (esboço)
export async function runAnalysis(input: AnalysisInput): Promise<BiomechResult> {
  if (hasLocalEngine(input.exerciseId)) {
    return runLocal(input); // MediaPipe no navegador
  }
  const gate = await checkCloudGate(input); // 3 condições
  if (!gate.ok) {
    throw new AnalysisBlocked(gate.reason); // motivo p/ UI
  }
  return runCloud(input, gate.consentId); // Edge Function server-only
}
```

## 5. Feature flag e faseamento (não travar o piloto)

- **Piloto = local-only (agachamento).** Libera já, sem esperar o jurídico.
- **Modo nuvem atrás de flag desligada** (`FEATURE_CLOUD_ANALYSIS=false`) até
  DPA + termo de consentimento + retenção estarem prontos. O código existe e é
  testado, mas não acende para nenhuma clínica sem o portão completo.
- Flag por organização (não global) quando acender, para rollout controlado.

## 6. Guardas técnicas do caminho nuvem (manter da spec de 13/07)

- Edge Function **server-only**; **nunca** expor service role, JWT de service ou
  signed URL no bundle do navegador.
- Signed URL do bucket `clinical-media` com **expiração curta**.
- `idempotencyKey` estável por análise (evita duplicidade e cobrança dupla).
- Validar no servidor: usuário autenticado, exercício permitido e **caminho do
  objeto pertence à organização/usuário** (checar contra RLS).
- Chamada: `POST {FISIOVISION_API_URL}/v1/consumers/pilatesvision/analyses`;
  consulta de status por `GET` com polling/webhook.

## 7. Enforcement do "local-only" no motor local (fecha a tela de erro raiz)

- MediaPipe/`@mediapipe/tasks-vision` e `getUserMedia` só no **cliente**: import
  **dinâmico**, componente **client-only** (montar após mount / guarda
  `typeof window !== 'undefined'`), nada em nível de módulo ou no SSR.
- `landmarker.close()` em `finally`/falha.
- Isso resolve a `error boundary` raiz recorrente (SSR 500 do TanStack Start).

## 8. Checklist LGPD antes de acender a nuvem

- [ ] Termo de consentimento **específico** para envio de vídeo a terceiro.
- [ ] DPA/contrato assinado com o FisioVision.
- [ ] Política de retenção/expiração nos dois lados (bucket + FisioVision).
- [ ] Base legal e finalidade documentadas.
- [ ] RLS confirmando que o path do objeto pertence à organização do usuário.
- [ ] Registro de consentimento persistido (tabela `consents` ou equivalente) com
      referência em `BiomechResult.cloud.consentId`.

## 9. "Cópia ou não" — decisão de reuso

- **Piloto:** manter o motor **inline** no PilatesVision (sem extração). Endurecer
  (SSR-safe, testes, calibração). Zero overhead novo.
- **Pós-piloto (se reuso real entre apps):** extrair **apenas o núcleo puro**
  `poseMetrics.ts` (sem React/DOM) para um pacote TS framework-agnóstico
  `biomech-core`, importado por PilatesVision e futuros apps. A cola MediaPipe
  fica por app. **Nunca** manter duas cópias divergentes do núcleo.

## 10. Escopo estrito desta entrega (para o Lovable)

Fazer:

1. `src/lib/biomech/types.ts` (contrato `BiomechResult`).
2. `src/lib/biomech/analysisEngine.ts` (roteador + portão).
3. Adaptar o motor local atual (`poseMetrics.ts`) para emitir `BiomechResult`
   (retrocompatível com o `biomechanics-mvp-v1` persistido).
4. Feature flag `FEATURE_CLOUD_ANALYSIS` (default **false**).
5. Testes determinísticos do roteador (local escolhido; nuvem bloqueada sem portão).

Não fazer (fica atrás da flag/pós-jurídico):

- Não acender o caminho nuvem em produção sem o checklist §8.
- Não alterar consentimentos/relatórios clínicos existentes.
- Não criar migration destrutiva; usar campos JSON existentes.
- Não expor segredos no bundle.

## 11. Anexo — rascunho de texto de consentimento (a validar juridicamente)

> **Consentimento para análise de vídeo em nuvem (opcional)**
> Para analisar este exercício, seu vídeo será enviado de forma segura e temporária a
> um serviço de processamento (FisioVision), usado **exclusivamente** para gerar o
> resultado biomecânico desta avaliação. O vídeo é transmitido por link com expiração
> curta e removido conforme a política de retenção. Você pode recusar e usar apenas a
> análise local quando disponível. Esta é uma estimativa de apoio à decisão e **não
> substitui** avaliação profissional.
> ☐ Autorizo o envio deste vídeo para análise em nuvem nesta avaliação.

_(Texto base — requer revisão jurídica/DPO antes de produção.)_
