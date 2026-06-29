import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPTS: Record<string, string> = {
  postural:
    "Você é um avaliador postural especializado em Pilates clínico. Analise a foto enviada e retorne uma avaliação curta, objetiva e em português, organizada em tópicos: (1) Alinhamento geral (cabeça, ombros, quadril, joelhos), (2) Assimetrias observadas, (3) Possíveis compensações, (4) Score postural estimado de 0 a 100 com uma frase justificando, (5) Sugestões clínicas iniciais. Seja prudente: indique 'não foi possível avaliar' quando a imagem não permitir conclusão.",
  dinamica:
    "Você é um avaliador de movimento especializado em Pilates. A partir do frame enviado de um exercício, retorne em português, em tópicos curtos: (1) Qualidade do movimento, (2) Controle motor, (3) Estabilidade lombopélvica, (4) Simetria, (5) Amplitude, (6) Compensações observadas, (7) 3 sugestões de correção. Seja prudente quando a imagem for ambígua.",
  exercicio:
    "Você é instrutor sênior de Pilates. Avalie a execução do exercício mostrado na imagem. Retorne em português, em tópicos: (1) Critérios técnicos cumpridos, (2) Compensações identificadas, (3) 3 sugestões objetivas de correção, (4) Indicação se está apto a progredir. Seja prudente quando a imagem não permitir avaliar com segurança.",
};

export const Route = createFileRoute("/api/analyze-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { image?: string; mode?: string; context?: string };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }
        const { image, mode, context } = payload;
        if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
          return new Response("Missing or invalid image (expected data:image/...;base64)", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const system = SYSTEM_PROMPTS[mode ?? "postural"] ?? SYSTEM_PROMPTS.postural;
        const userText = context
          ? `Contexto adicional do profissional: ${context}\n\nAnalise a imagem.`
          : "Analise a imagem enviada.";

        const res = await fetch(GATEWAY_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: [
                  { type: "text", text: userText },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          const status = res.status === 429 || res.status === 402 ? res.status : 502;
          return new Response(
            status === 429
              ? "Limite de requisições atingido. Tente novamente em instantes."
              : status === 402
              ? "Créditos de IA esgotados nesta workspace."
              : `Falha ao analisar a imagem (${res.status}). ${text.slice(0, 200)}`,
            { status },
          );
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const analysis = data?.choices?.[0]?.message?.content?.trim() ?? "";
        if (!analysis) {
          return new Response("Resposta vazia do modelo", { status: 502 });
        }
        return Response.json({ analysis });
      },
    },
  },
});