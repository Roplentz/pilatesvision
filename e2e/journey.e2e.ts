/**
 * Playwright E2E — jornada canônica multi-clínica.
 *
 * Ignorado por padrão: exige Supabase local em execução e usuários semeados.
 * Ver docs/SPRINT_ZERO_STABILIZATION.md § "Rodando E2E localmente" para o passo-a-passo.
 *
 * Habilitar setando: RUN_E2E=1
 */
import { test, expect } from "@playwright/test";

const shouldRun = process.env.RUN_E2E === "1";

test.describe.skip(!shouldRun, "Jornada multi-clínica", () => {
  test("usuário A e usuário B não veem dados um do outro", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    // Login A
    await pageA.goto("/auth");
    await pageA.getByLabel(/e-?mail/i).fill(process.env.E2E_USER_A_EMAIL!);
    await pageA.getByLabel(/senha/i).fill(process.env.E2E_USER_A_PASSWORD!);
    await pageA.getByRole("button", { name: /entrar/i }).click();
    await pageA.waitForURL(/\/(dashboard|onboarding|alunos)/);

    // Login B
    await pageB.goto("/auth");
    await pageB.getByLabel(/e-?mail/i).fill(process.env.E2E_USER_B_EMAIL!);
    await pageB.getByLabel(/senha/i).fill(process.env.E2E_USER_B_PASSWORD!);
    await pageB.getByRole("button", { name: /entrar/i }).click();
    await pageB.waitForURL(/\/(dashboard|onboarding|alunos)/);

    // A cria paciente
    await pageA.goto("/alunos/novo");
    await pageA.getByLabel(/nome/i).first().fill("Paciente Alpha");
    await pageA.getByRole("button", { name: /salvar|criar/i }).click();

    // B lista pacientes — não deve ver Alpha
    await pageB.goto("/alunos");
    await expect(pageB.getByText("Paciente Alpha")).toHaveCount(0);

    await ctxA.close();
    await ctxB.close();
  });
});
