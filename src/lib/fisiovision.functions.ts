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
const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 min — tempo suficiente para o worker processar.

class HandledError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

function readIntegrationConfig() {
  const apiUrl = process.env.FISIOVISION_API_URL;
  const token = process.env.FISIOVISION_API_TOKEN;
  const consumerId = process.env.FISIOVISION_CONSUMER_ID || "pilatesvision";
  if (!apiUrl || !token) {
    throw new HandledError("config_missing", 503, "FisioVision não configurado");
  }
  return { apiUrl: apiUrl.replace(/\/$/, ""), token, consumerId };
}

function normalizeStatus(raw: unknown): FisiovisionAnalysisStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "queued" || s === "pending") return "queued";
  if (s === "processing" || s === "running") return "processing";
  if (s === "completed" || s === "done" || s === "success" || s === "succeeded") return "completed";
  if (s === "failed" || s === "error" || s === "canceled") return "failed";
  return "queued";
}

function mapUpstreamStatus(httpStatus: number): HandledError {
  if (httpStatus === 400) return new HandledError("bad_request", 400);
  if (httpStatus === 401) return new HandledError("unauthorized", 401);
  if (httpStatus === 403) return new HandledError("forbidden", 403);
  if (httpStatus === 404) return new HandledError("not_found", 404);
  if (httpStatus === 429) return new HandledError("rate_limited", 429);
  if (httpStatus === 503) return new HandledError("service_unavailable", 503);
  return new HandledError("upstream_error", 502, `Upstream ${httpStatus}`);
}

async function assertVideoPathBelongsToClinic(supabase: {
  from: (t: string) => {
    select: (
      c: string,
    ) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: unknown }> } };
  };
}, userId: string, videoPath: string) {
  // path canônico: {clinicId}/{patientId}/{assessmentId}/{arquivo}
  const parts = videoPath.split("/").filter(Boolean);
  if (parts.length < 2) throw new HandledError("invalid_video_path", 400);
  const pathClinicId = parts[0];
  const rpc = await (
    supabase as unknown as {
      rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>;
    }
  ).rpc("current_user_clinic_id");
  const clinicId = rpc?.data ?? null;
  if (!clinicId || clinicId !== pathClinicId) {
    throw new HandledError("invalid_video_path", 403);
  }
  void userId;
}

function makeIdempotencyKey(userId: string, videoPath: string, exerciseId: string): string {
  // Estável por (usuário, vídeo, exercício) — garante que reenviar o mesmo pedido
  // não crie uma segunda análise no upstream.
  return `pv:${userId}:${exerciseId}:${videoPath}`;
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
      if (!input || typeof input !== "object") throw new Error("payload inválido");
      if (typeof input.videoPath !== "string" || input.videoPath.length === 0)
        throw new Error("videoPath obrigatório");
      if (
        !(FISIOVISION_ALLOWED_EXERCISES as readonly string[]).includes(input.exerciseId)
      ) {
        throw new HandledError("invalid_exercise", 400);
      }
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
      const { supabase, userId } = context as { supabase: unknown; userId: string };
      const authed = supabase as {
        rpc: (fn: string) => Promise<{ data: string | null; error: unknown }>;
      };
      // 1) Valida escopo do path.
      await assertVideoPathBelongsToClinic(
        supabase as never,
        userId,
        data.videoPath,
      );

      const config = readIntegrationConfig();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 2) Signed URL com TTL curto — nunca retorna ao browser.
      const signed = await supabaseAdmin.storage
        .from(CLINICAL_MEDIA_BUCKET)
        .createSignedUrl(data.videoPath, SIGNED_URL_TTL_SECONDS);
      if (signed.error || !signed.data?.signedUrl) {
        throw new HandledError("invalid_video_path", 404, signed.error?.message);
      }

      const idempotencyKey = makeIdempotencyKey(userId, data.videoPath, data.exerciseId);

      // 3) Idempotência local: reaproveita registro anterior se existir.
      const existing = await supabaseAdmin
        .from("fisiovision_analyses")
        .select("id,status,exercise_id,result,error,created_at,updated_at")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing.data && !existing.error) {
        return toDTO(existing.data as never);
      }

      // 4) Chama upstream.
      const clinicRpc = await authed.rpc("current_user_clinic_id");
      const clinicId = clinicRpc?.data ?? null;

      const upstreamRes = await fetch(
        `${config.apiUrl}/v1/consumers/${encodeURIComponent(config.consumerId)}/analyses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.token}`,
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            idempotencyKey,
            exerciseId: data.exerciseId,
            videoUrl: signed.data.signedUrl,
            metadata: {
              source: "pilatesvision",
              userId,
              clinicId,
              assessmentId: data.assessmentId,
              patientId: data.patientId,
            },
          }),
        },
      );

      if (!upstreamRes.ok) throw mapUpstreamStatus(upstreamRes.status);

      const body = (await upstreamRes.json().catch(() => ({}))) as {
        id?: string;
        status?: string;
        result?: FisiovisionJson;
        error?: { code?: string; message?: string } | null;
      };
      if (!body.id) throw new HandledError("upstream_error", 502, "resposta sem id");

      // 5) Persiste referência mínima. Não guardamos a signed URL (curta).
      const now = new Date().toISOString();
      const insert = await supabaseAdmin
        .from("fisiovision_analyses")
        .insert({
          id: body.id,
          consumer_id: config.consumerId,
          exercise_id: data.exerciseId,
          status: normalizeStatus(body.status),
          video_url: data.videoPath, // path interno, NÃO signed URL
          idempotency_key: idempotencyKey,
          metadata: {
            userId,
            clinicId,
            assessmentId: data.assessmentId,
            patientId: data.patientId,
          },
          result: (body.result ?? null) as never,
          error: (body.error ?? null) as never,
          created_at: now,
          updated_at: now,
        })
        .select("id,status,exercise_id,result,error,created_at,updated_at")
        .single();

      if (insert.error || !insert.data) {
        // Se falhou a persistência local mas o upstream aceitou, ainda retornamos DTO.
        return {
          id: body.id,
          status: normalizeStatus(body.status),
          exerciseId: data.exerciseId,
          result: body.result ?? null,
          error: body.error ?? null,
          createdAt: now,
          updatedAt: now,
        } satisfies FisiovisionAnalysisDTO;
      }
      return toDTO(insert.data as never);
    } catch (e) {
      throw serializeHandled(e);
    }
  });

export const getFisiovisionAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string")
      throw new Error("id obrigatório");
    return { id: input.id };
  })
  .handler(async ({ data, context }) => {
    try {
      const { userId } = context as { userId: string };
      const config = readIntegrationConfig();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1) Confere ownership via metadata.userId.
      const local = await supabaseAdmin
        .from("fisiovision_analyses")
        .select("id,status,exercise_id,result,error,metadata,created_at,updated_at")
        .eq("id", data.id)
        .maybeSingle();
      if (!local.data) throw new HandledError("not_found", 404);
      const meta = (local.data as { metadata?: { userId?: string } }).metadata ?? {};
      if (meta.userId && meta.userId !== userId) {
        throw new HandledError("forbidden", 403);
      }

      // 2) Consulta upstream.
      const upstreamRes = await fetch(
        `${config.apiUrl}/v1/consumers/${encodeURIComponent(config.consumerId)}/analyses/${encodeURIComponent(data.id)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${config.token}` },
        },
      );

      if (upstreamRes.status === 404) {
        // Upstream perdeu o registro — retorna o snapshot local.
        return toDTO(local.data as never);
      }
      if (!upstreamRes.ok) throw mapUpstreamStatus(upstreamRes.status);

      const body = (await upstreamRes.json().catch(() => ({}))) as {
        id?: string;
        status?: string;
        result?: FisiovisionJson;
        error?: { code?: string; message?: string } | null;
      };
      const status = normalizeStatus(body.status);

      // 3) Sincroniza local se mudou.
      const before = local.data as {
        status: string;
        result: unknown | null;
        error: unknown | null;
      };
      const changed =
        before.status !== status ||
        JSON.stringify(before.result ?? null) !== JSON.stringify(body.result ?? null) ||
        JSON.stringify(before.error ?? null) !== JSON.stringify(body.error ?? null);
      if (changed) {
        await supabaseAdmin
          .from("fisiovision_analyses")
          .update({
            status,
            result: (body.result ?? null) as never,
            error: (body.error ?? null) as never,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);
      }

      return {
        id: data.id,
        status,
        exerciseId: (local.data as { exercise_id: string }).exercise_id,
        result: body.result ?? null,
        error: body.error ?? null,
        createdAt: (local.data as { created_at: string }).created_at,
        updatedAt: new Date().toISOString(),
      } satisfies FisiovisionAnalysisDTO;
    } catch (e) {
      throw serializeHandled(e);
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
    result: row.result ?? null,
    error: (row.error as { code?: string; message?: string } | null) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeHandled(e: unknown): Error {
  if (e instanceof HandledError) {
    const err = new Error(e.code);
    (err as unknown as { code: string; httpStatus: number }).code = e.code;
    (err as unknown as { code: string; httpStatus: number }).httpStatus = e.httpStatus;
    return err;
  }
  console.error("[fisiovision] erro não tratado", e);
  const err = new Error("upstream_error");
  (err as unknown as { code: string; httpStatus: number }).code = "upstream_error";
  (err as unknown as { code: string; httpStatus: number }).httpStatus = 502;
  return err;
}