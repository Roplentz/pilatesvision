import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "E2E requires SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const email = `camera-e2e-${runId}@example.test`;
const password = "PilatesVision-Camera-2026!";
let assessmentId = "";

async function provisionAssessment() {
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Câmera E2E" },
  });
  if (userError || !userData.user) {
    throw new Error(`Unable to create camera E2E user: ${userError?.message ?? "missing user"}`);
  }

  const deadline = Date.now() + 15_000;
  let clinicId: string | null = null;
  while (Date.now() < deadline && !clinicId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("clinic_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    clinicId = profile?.clinic_id ?? null;
    if (!clinicId) await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (!clinicId) throw new Error("The camera E2E profile was not created in time.");

  const { data: patient, error: patientError } = await admin
    .from("patients")
    .insert({
      clinic_id: clinicId,
      name: "Paciente Câmera E2E",
    })
    .select("id")
    .single();
  if (patientError || !patient) throw new Error(patientError?.message ?? "Patient insert failed");

  const { error: consentError } = await admin.from("patient_consents").insert({
    clinic_id: clinicId,
    patient_id: patient.id,
    responsible_professional_id: userData.user.id,
    consent_lgpd: true,
    consent_image_use: true,
    consent_ai_support: true,
    accepted_at: new Date().toISOString(),
  });
  if (consentError) throw new Error(consentError.message);

  const { data: assessment, error: assessmentError } = await admin
    .from("assessments")
    .insert({
      clinic_id: clinicId,
      patient_id: patient.id,
      type: "postural_static",
      status: "draft",
      title: "Teste móvel de câmera",
      main_complaint: "Teste automatizado",
    })
    .select("id")
    .single();
  if (assessmentError || !assessment) {
    throw new Error(assessmentError?.message ?? "Assessment insert failed");
  }
  assessmentId = assessment.id;
}

test.beforeAll(async () => {
  await provisionAssessment();
});

test("seleção frontal e traseira permanece utilizável em viewport móvel", async ({ page }) => {
  await page.goto("/auth");
  const loginForm = page.locator("form");
  await loginForm.getByLabel("E-mail").fill(email);
  await loginForm.getByLabel("Senha").fill(password);
  await loginForm.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto(`/avaliacoes/${assessmentId}`);
  await page.getByRole("tab", { name: "Captura ao vivo" }).click();

  await expect(page.getByText("Prepare a câmera antes da captura")).toBeVisible();
  await expect(page.getByText("Comece a 2,5–3 m")).toBeVisible();

  const cameraField = page.getByText("Câmera", { exact: true }).locator("..");
  const cameraSelect = cameraField.getByRole("combobox");

  await expect(cameraSelect).toContainText("Traseira");
  await cameraSelect.click();
  await page.getByRole("option", { name: "Frontal" }).click();
  await expect(cameraField.getByText("Útil para autoenquadramento")).toBeVisible();

  await cameraSelect.click();
  await page.getByRole("option", { name: "Traseira — recomendada" }).click();
  await expect(cameraField.getByText("Maior qualidade e menor distorção")).toBeVisible();
});
