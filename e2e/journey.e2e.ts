import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "E2E requires SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const email = `p0-e2e-${runId}@example.test`;
const password = "PilatesVision-E2E-2026!";
const patientName = `Paciente E2E ${runId}`;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function provisionUser() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Profissional E2E" },
  });

  if (error || !data.user) {
    throw new Error(`Unable to create E2E user: ${error?.message ?? "missing user"}`);
  }

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id,clinic_id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.clinic_id) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error("The signup trigger did not create the E2E profile and clinic in time.");
}

test.beforeAll(async () => {
  await provisionUser();
});

test("jornada clínica completa gera e armazena PDF", async ({ page }) => {
  await page.goto("/auth");
  const loginForm = page.locator("form");
  await loginForm.getByLabel("E-mail").fill(email);
  await loginForm.getByLabel("Senha").fill(password);
  await loginForm.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/alunos/novo");
  await page.getByLabel("Nome completo *").fill(patientName);
  await page.getByLabel("Idade (se não informar data)").fill("42");
  await page.getByLabel("Objetivo principal").fill("Melhorar controle postural");
  await page.getByLabel("Queixa principal").fill("Desconforto lombar ao final do dia");
  await page
    .getByLabel("O paciente forneceu consentimento para uso dos dados clínicos e imagens")
    .check();
  await page.getByRole("button", { name: "Cadastrar paciente" }).click();
  await expect(page).toHaveURL(/\/alunos\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: patientName })).toBeVisible();

  const consentSection = page.locator("section#consentimento");
  await consentSection
    .locator("label")
    .filter({ hasText: "Consentimento LGPD geral" })
    .getByRole("checkbox")
    .check();
  await consentSection
    .locator("label")
    .filter({ hasText: "Uso de imagem e vídeo" })
    .getByRole("checkbox")
    .check();
  await consentSection
    .locator("label")
    .filter({ hasText: "Apoio por análise automática" })
    .getByRole("checkbox")
    .check();
  await consentSection.getByRole("button", { name: "Salvar consentimento" }).click();
  await expect(consentSection.getByText("Uso de imagem autorizado.")).toBeVisible();

  await page.getByRole("button", { name: "Nova avaliação" }).click();
  await expect(page).toHaveURL(/\/avaliacoes\/nova/);
  await page.getByLabel("Título (opcional)").fill("Avaliação P0 automatizada");
  await page.getByLabel("Objetivo").fill("Documentar alinhamento inicial");
  await page.getByLabel("Queixa principal").fill("Desconforto lombar ao final do dia");
  await page.getByLabel("Observações clínicas").fill("Paciente apto para avaliação observacional.");
  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page).toHaveURL(/\/avaliacoes\/[0-9a-f-]+$/);

  await page.getByRole("button", { name: "Adicionar vista" }).click();
  await page.getByPlaceholder("Região (ex.: ombros)").fill("Ombros");
  await page.getByPlaceholder("Achado (ex.: elevação D)").fill("Assimetria aparente leve");
  await page.getByPlaceholder("Notas (opcional)").fill("Confirmar clinicamente");
  await page.getByRole("button", { name: "Adicionar achado" }).click();
  await page.getByLabel("Observações do profissional").fill("Registro observacional inicial.");
  await page.getByRole("button", { name: "Salvar vista" }).click();
  await expect(page.getByText("Assimetria aparente leve")).toBeVisible();

  await page.getByRole("button", { name: "Finalizar avaliação" }).click();
  const finalizeAssessmentDialog = page.getByRole("alertdialog");
  await finalizeAssessmentDialog.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(page.getByText("Finalizada", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Gerar relatório" }).click();
  await expect(page).toHaveURL(/\/relatorios\/[0-9a-f-]+$/);
  await page.getByRole("button", { name: "Finalizar", exact: true }).click();
  await expect(page.getByText("Finalizado", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Exportar PDF" }).click();
  await expect(page.getByRole("button", { name: "Baixar PDF" })).toBeVisible({ timeout: 30_000 });

  const { count: reportCount, error: reportError } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "finalized")
    .not("pdf_storage_path", "is", null);
  expect(reportError).toBeNull();
  expect(reportCount ?? 0).toBeGreaterThan(0);
});
