import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_assessment",
  title: "Detalhe da avaliação",
  description:
    "Retorna a avaliação com seus resultados posturais/movimento, exercícios prescritos e relatório.",
  inputSchema: {
    assessment_id: z.string().uuid().describe("ID da avaliação."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ assessment_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const client = sb(ctx);
    const { data, error } = await client
      .from("assessments")
      .select("*, postural_results(*), movement_results(*), prescribed_exercises(*), reports(*)")
      .eq("id", assessment_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return { content: [{ type: "text", text: "Avaliação não encontrada." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { assessment: data },
    };
  },
});
