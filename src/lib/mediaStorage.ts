import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CLINICAL_MEDIA_BUCKET = "clinical-media";
export const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type MediaKind = "video" | "image";

export function acceptAttrFor(kind: MediaKind): string {
  return (kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES).join(",");
}

export function validateMediaFile(
  file: File,
  kind: MediaKind,
): { ok: true } | { ok: false; error: string } {
  const allowed = (
    kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES
  ) as readonly string[];
  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      error:
        kind === "video"
          ? "Formato de vídeo não suportado. Use MP4, MOV ou WEBM."
          : "Formato de imagem não suportado. Use JPG, PNG ou WEBP.",
    };
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return { ok: false, error: "Arquivo excede 50MB." };
  }
  return { ok: true };
}

function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base =
    (dot >= 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "arquivo";
  const ext =
    dot >= 0
      ? name
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "")
      : "";
  return ext ? `${base}.${ext}` : base;
}

/** Constrói o path obrigatório: {clinicId}/{patientId}/{assessmentId}/{arquivo} */
export function buildClinicalMediaPath(params: {
  clinicId: string;
  patientId: string;
  assessmentId: string;
  fileName: string;
}): string {
  const stamp = Date.now();
  const safe = sanitizeFileName(params.fileName);
  return `${params.clinicId}/${params.patientId}/${params.assessmentId}/${stamp}-${safe}`;
}

export async function uploadClinicalMedia(params: {
  file: File;
  clinicId: string;
  patientId: string;
  assessmentId: string;
  kind: MediaKind;
}): Promise<{ path: string }> {
  const v = validateMediaFile(params.file, params.kind);
  if (!v.ok) throw new Error(v.error);
  const path = buildClinicalMediaPath({
    clinicId: params.clinicId,
    patientId: params.patientId,
    assessmentId: params.assessmentId,
    fileName: params.file.name,
  });
  const { error } = await supabase.storage.from(CLINICAL_MEDIA_BUCKET).upload(path, params.file, {
    contentType: params.file.type,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);
  return { path };
}

export async function createSignedMediaUrl(
  path: string,
  expiresInSeconds = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(CLINICAL_MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  if (!data?.signedUrl) throw new Error("Falha ao gerar URL assinada.");
  return data.signedUrl;
}

/** Hook: gera URL assinada de um objeto no bucket clinical-media. */
export function useSignedMediaUrl(path: string | null | undefined, expiresInSeconds = 60 * 60) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    createSignedMediaUrl(path, expiresInSeconds)
      .then((u) => {
        if (cancelled) return;
        setUrl(u);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, expiresInSeconds]);

  return { url, loading, error };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
