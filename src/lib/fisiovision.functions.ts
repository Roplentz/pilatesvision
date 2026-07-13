import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  FISIOVISION_ALLOWED_EXERCISES,
  type FisiovisionAnalysisDTO,
  type FisiovisionAnalysisStatus,
  type FisiovisionExerciseId,
  type FisiovisionJson,
} from "./fisiovision.types";

const CLINICAL_MEDIA_BUCKET = "clinical-media";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

class HandledError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

type IntegrationConfig = {
  apiUrl: string;
  consumerId: string;
  staticToken?: string;
  jwt?: {
    privateKey: string;
    keyId: string;
    issuer: string;
    audience: string;
    subject: string;
  };
};

function readIntegrationConfig(): IntegrationConfig {
  const apiUrl = process.env.FISIOVISION_API_URL;
  const consumerId = process.env.FISIOVISION_CONSUMER_ID || "pilatesvision";
  const staticToken = process.env.FISIOVISION_API_TOKEN;
  const privateKey = process.env.FISIOVISION_JWT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  const keyId = process.env.FISIOVISION_JWT_KEY_ID;
  const issuer = process.env.FISIOVISION_JWT_ISSUER;
  const audience = process.env.FISIOVISION_JWT_AUDIENCE;
  const subject =
    process.env.FISIOVISION_JWT_SUBJECT || "pilatesvision-service";
  const jwt =
    privateKey && keyId && issuer && audience
      ? { privateKey, keyId, issuer, audience, subject }
      : undefined;
  if (!apiUrl || (!jwt && !staticToken)) {
    throw new HandledError(
      "config_missing",
      503,
      "FisioVision não configurado",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(apiUrl);
  } catch {
    throw new HandledError("config_missing", 503);
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new HandledError("config_missing", 503, "FisioVision exige HTTPS");
  }
  return { apiUrl: apiUrl.replace(/\/$/, ""), consumerId, staticToken, jwt };
}

function base64url(value: string | Uint8Array): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function authorizationToken(config: IntegrationConfig): Promise<string> {
  if (!config.jwt) return config.staticToken!;
  const { createSign } = await import("node:crypto");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    JSON.stringify({ alg: "RS256", typ: "JWT", kid: config.jwt.keyId }),
  );
  const payload = base64url(
    JSON.stringify({
      sub: config.jwt.subject,
      iss: config.jwt.issuer,
      aud: config.jwt.audience,
      iat: now,
      nbf: now - 5,
      exp: now + 300,
      consumers: [config.consumerId],
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  return `${signingInput}.${base64url(signer.sign(config.jwt.privateKey))}`;
}

export async function makeIdempotencyKey(
  userId: string,
  videoPath: string,
  exerciseId: string,
): Promise<string> {
  const { createHash } = await import("node:crypto");
  const digest = createHash("sha256")
    .update(`${userId}\0${exerciseId}\0${videoPath}`, "utf8")
    .digest("hex");
  return `pv:${digest}`;
}

function normalizeStatus(raw: unknown): FisiovisionAnalysisStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "queued" || s === "pending") return "queued";
  if (s === "processing" || s === "running") return "processing";
  if (["completed", "done", "success", "succeeded"].includes(s))
    return "completed";
  if (["failed", "error", "canceled", "cancelled"].includes(s)) return "failed";
  return "queued";
}

function mapUpstreamStatus(status: number): HandledError {
  const known: Record<number, [string, number]> = {
    400: ["bad_request", 400],
    401: ["unauthorized", 401],
    403: ["forbidden", 403],
    404: ["not_found", 404],
    429: ["rate_limited", 429],
    503: ["service_unavailable", 503],
  };
  const [code, httpStatus] = known[status] ?? ["upstream_error", 502];
  return new HandledError(code, httpStatus);
}

function parseClinicalPath(path: string) {
  if (path.includes("..") || path.startsWith("/") || path.includes("\\"))
    throw new HandledError("invalid_video_path", 400);
  const parts = path.split("/");
  if (parts.length !== 4 || parts.some((part) => !part))
    throw new HandledError("invalid_video_path", 400);
  return {
    clinicId: parts[0]!,
    patientId: parts[1]!,
    assessmentId: parts[2]!,
    fileName: parts[3]!,
    folder: parts.slice(0, 3).join("/"),
  };
}

async function validateClinicalVideo(
  supabase: {
    rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>;
  },
  admin: any,
  path: string,
  requestedPatientId: string | null,
  requestedAssessmentId: string | null,
) {
  const parsed = parseClinicalPath(path);
  const clinic = await supabase.rpc("current_user_clinic_id");
  if (clinic.error || !clinic.data || clinic.data !== parsed.clinicId)
    throw new HandledError("invalid_video_path", 403);
  if (requestedPatientId && requestedPatientId !== parsed.patientId)
    throw new HandledError("invalid_video_path", 403);
  if (requestedAssessmentId && requestedAssessmentId !== parsed.assessmentId)
    throw new HandledError("invalid_video_path", 403);
  const assessment = await admin
    .from("assessments")
    .select("id,clinic_id,patient_id")
    .eq("id", parsed.assessmentId)
    .maybeSingle();
  if (
    assessment.error ||
    !assessment.data ||
    assessment.data.clinic_id !== parsed.clinicId ||
    assessment.data.patient_id !== parsed.patientId
  ) {
    throw new HandledError("invalid_video_path", 403);
  }
  const listed = await admin.storage
    .from(CLINICAL_MEDIA_BUCKET)
    .list(parsed.folder, { search: parsed.fileName, limit: 10 });
  const object = listed.data?.find(
    (item: { name: string }) => item.name === parsed.fileName,
  );
  if (listed.error || !object)
    throw new HandledError("invalid_video_path", 404);
  const size = Number(object.metadata?.size ?? 0);
  const mime = String(
    object.metadata?.mimetype ?? object.metadata?.contentType ?? "",
  ).toLowerCase();
  if (
    !VIDEO_MIME_TYPES.has(mime) ||
    !Number.isFinite(size) ||
    size <= 0 ||
    size > MAX_VIDEO_BYTES
  ) {
    throw new HandledError("invalid_video", 400);
  }
  return parsed;
}

async function fetchUpstream(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(15_000),
      redirect: "error",
    });
  } catch {
    throw new HandledError("service_unavailable", 503);
  }
}

export const createFisiovisionAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      exerciseId: string;
      videoPath: string;
      assessmentId?: string | null;
      patientId?: string | null;
    }) => {
      if (!input || typeof input.videoPath !== "string" || !input.videoPath)
        throw new HandledError("invalid_video_path", 400);
      if (
        !(FISIOVISION_ALLOWED_EXERCISES as readonly string[]).includes(
          input.exerciseId,
        )
      )
        throw new HandledError("invalid_exercise", 400);
      return {
        exerciseId: input.exerciseId as FisiovisionExerciseId,
        videoPath: input.videoPath,
        assessmentId: input.assessmentId ?? null,
        patientId: input.patientId ?? null,
      };
    },
  )
  .handler(async ({ data, context }) => {
    try {
      const { supabase, userId } = context as {
        supabase: {
          rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>;
        };
        userId: string;
      };
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");
      const clinical = await validateClinicalVideo(
        supabase,
        supabaseAdmin,
        data.videoPath,
        data.patientId,
        data.assessmentId,
      );
      const config = readIntegrationConfig();
      const idempotencyKey = await makeIdempotencyKey(
        userId,
        data.videoPath,
        data.exerciseId,
      );
      const existing = await supabaseAdmin
        .from("fisiovision_analyses")
        .select(
          "id,status,exercise_id,result,error,created_at,updated_at,metadata",
        )
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (
        existing.data &&
        (existing.data.metadata as { userId?: string } | null)?.userId ===
          userId
      )
        return toDTO(existing.data as never);
      const signed = await supabaseAdmin.storage
        .from(CLINICAL_MEDIA_BUCKET)
        .createSignedUrl(data.videoPath, SIGNED_URL_TTL_SECONDS);
      if (signed.error || !signed.data?.signedUrl)
        throw new HandledError("invalid_video_path", 404);
      const token = await authorizationToken(config);
      const metadata: Record<string, string> = {
        source: "pilatesvision",
        userId,
        clinicId: clinical.clinicId,
        patientId: clinical.patientId,
        assessmentId: clinical.assessmentId,
      };
      const response = await fetchUpstream(
        `${config.apiUrl}/v1/consumers/${encodeURIComponent(config.consumerId)}/analyses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            exerciseId: data.exerciseId,
            videoUrl: signed.data.signedUrl,
            idempotencyKey,
            metadata,
          }),
        },
      );
      if (!response.ok) throw mapUpstreamStatus(response.status);
      const body = (await response.json()) as {
        id?: string;
        status?: string;
        result?: FisiovisionJson;
        error?: { code?: string; message?: string } | null;
        createdAt?: string;
        updatedAt?: string;
      };
      if (!body.id) throw new HandledError("upstream_error", 502);
      return {
        id: body.id,
        status: normalizeStatus(body.status),
        exerciseId: data.exerciseId,
        result: body.result ?? null,
        error: body.error ?? null,
        createdAt: body.createdAt ?? new Date().toISOString(),
        updatedAt: body.updatedAt ?? new Date().toISOString(),
      } satisfies FisiovisionAnalysisDTO;
    } catch (error) {
      throw serializeHandled(error);
    }
  });

export const getFisiovisionAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string")
      throw new HandledError("bad_request", 400);
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    try {
      const { userId } = context as { userId: string };
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");
      const local = await supabaseAdmin
        .from("fisiovision_analyses")
        .select(
          "id,status,exercise_id,result,error,metadata,created_at,updated_at",
        )
        .eq("id", data.id)
        .maybeSingle();
      if (!local.data) throw new HandledError("not_found", 404);
      if (
        (local.data.metadata as { userId?: string } | null)?.userId !== userId
      )
        throw new HandledError("forbidden", 403);
      const config = readIntegrationConfig();
      const token = await authorizationToken(config);
      const response = await fetchUpstream(
        `${config.apiUrl}/v1/consumers/${encodeURIComponent(config.consumerId)}/analyses/${encodeURIComponent(data.id)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 404) throw new HandledError("not_found", 404);
      if (!response.ok) throw mapUpstreamStatus(response.status);
      const body = (await response.json()) as {
        status?: string;
        result?: FisiovisionJson;
        error?: { code?: string; message?: string } | null;
      };
      const status = normalizeStatus(body.status);
      await supabaseAdmin
        .from("fisiovision_analyses")
        .update({
          status,
          result: body.result ?? null,
          error: body.error ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id);
      return {
        id: data.id,
        status,
        exerciseId: local.data.exercise_id,
        result: body.result ?? null,
        error: body.error ?? null,
        createdAt: local.data.created_at,
        updatedAt: new Date().toISOString(),
      } satisfies FisiovisionAnalysisDTO;
    } catch (error) {
      throw serializeHandled(error);
    }
  });

function toDTO(row: {
  id: string;
  status: string;
  exercise_id: string;
  result: unknown | null;
  error: unknown | null;
  created_at: string;
  updated_at: string;
}): FisiovisionAnalysisDTO {
  return {
    id: row.id,
    status: normalizeStatus(row.status),
    exerciseId: row.exercise_id,
    result: (row.result as FisiovisionJson | null) ?? null,
    error: (row.error as { code?: string; message?: string } | null) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeHandled(error: unknown): Error {
  const handled =
    error instanceof HandledError
      ? error
      : new HandledError("upstream_error", 502);
  if (!(error instanceof HandledError))
    console.error("[fisiovision] erro não tratado", error);
  const serialized = new Error(handled.code);
  Object.assign(serialized, {
    code: handled.code,
    httpStatus: handled.httpStatus,
  });
  return serialized;
}
