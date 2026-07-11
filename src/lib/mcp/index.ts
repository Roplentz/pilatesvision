import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPatients from "./tools/list-patients";
import createPatient from "./tools/create-patient";
import listAssessments from "./tools/list-assessments";
import getAssessment from "./tools/get-assessment";

// The OAuth issuer must be the direct Supabase host (not the .lovable.cloud proxy).
// VITE_SUPABASE_PROJECT_ID is inlined at build time by Vite.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pilatesvision-mcp",
  title: "PilatesVision",
  version: "0.1.0",
  instructions:
    "Ferramentas para gerenciar alunos e avaliações posturais/dinâmicas de Pilates dentro do PilatesVision. Todas as operações respeitam a clínica e o usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPatients, createPatient, listAssessments, getAssessment],
});
