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
  name: "list_assessments",
  title: "Listar avaliações",
  description: "Lista avaliações posturais/dinâmicas/exercício, opcionalmente filtradas por aluno.",
  inputSchema: {
    student_id: z.string().uuid().optional().describe("ID do aluno para filtrar."),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ student_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    let q = sb(ctx)
      .from("assessments")
      .select("id, student_id, type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (student_id) q = q.eq("student_id", student_id);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { assessments: data },
    };
  },
});