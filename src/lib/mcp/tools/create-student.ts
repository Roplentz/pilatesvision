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
  name: "create_student",
  title: "Cadastrar aluno",
  description: "Cria um novo aluno na clínica do usuário autenticado.",
  inputSchema: {
    full_name: z.string().trim().min(1).describe("Nome completo do aluno."),
    email: z.string().email().optional().describe("E-mail de contato."),
    phone: z.string().optional().describe("Telefone de contato."),
    birth_date: z.string().optional().describe("Data de nascimento em formato YYYY-MM-DD."),
    notes: z.string().optional().describe("Observações clínicas iniciais."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const client = sb(ctx);
    const { data: profile, error: profileErr } = await client
      .from("profiles")
      .select("clinic_id")
      .eq("id", ctx.getUserId())
      .maybeSingle();
    if (profileErr) return { content: [{ type: "text", text: profileErr.message }], isError: true };
    if (!profile?.clinic_id) {
      return { content: [{ type: "text", text: "Usuário sem clínica associada." }], isError: true };
    }
    const { data, error } = await client
      .from("students")
      .insert({ ...input, clinic_id: profile.clinic_id })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Aluno criado: ${data.id}` }],
      structuredContent: { student: data },
    };
  },
});
