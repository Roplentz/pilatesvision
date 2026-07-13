import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader2, RefreshCw, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useIsPlatformAdmin } from "@/hooks/useIsPlatformAdmin";
import {
  buildClinicalMediaPath,
  CLINICAL_MEDIA_BUCKET,
  formatBytes,
  validateMediaFile,
  acceptAttrFor,
} from "@/lib/mediaStorage";
import {
  FISIOVISION_ALLOWED_EXERCISES,
  FISIOVISION_EXERCISE_LABELS,
  translateFisiovisionError,
  type FisiovisionAnalysisDTO,
  type FisiovisionAnalysisStatus,
  type FisiovisionExerciseId,
} from "@/lib/fisiovision.types";
import {
  createFisiovisionAnalysis,
  getFisiovisionAnalysis,
} from "@/lib/fisiovision.functions";

interface Props {
  clinicId: string;
  patientId: string;
  assessmentId: string;
  /** Vídeo já enviado ao bucket, opcional. Se ausente, o componente cuida do upload. */
  initialVideoPath?: string | null;
  onCompleted?: (analysis: FisiovisionAnalysisDTO) => void;
}

const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 min
const POLL_START_MS = 2000;
const POLL_MAX_MS = 15000;

function statusBadge(s: FisiovisionAnalysisStatus): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (s) {
    case "queued":
      return { label: "Na fila", variant: "outline" };
    case "processing":
      return { label: "Processando", variant: "secondary" };
    case "completed":
      return { label: "Concluída", variant: "default" };
    case "failed":
      return { label: "Falhou", variant: "destructive" };
  }
}

function extractErrorCode(err: unknown): string {
  if (err && typeof err === "object") {
    const anyErr = err as { code?: string; message?: string };
    if (typeof anyErr.code === "string") return anyErr.code;
    if (typeof anyErr.message === "string") return anyErr.message;
  }
  return "upstream_error";
}

export function FisiovisionAnalyzer({
  clinicId,
  patientId,
  assessmentId,
  initialVideoPath,
  onCompleted,
}: Props) {
  const { isPlatformAdmin } = useIsPlatformAdmin();
  const createFn = useServerFn(createFisiovisionAnalysis);
  const getFn = useServerFn(getFisiovisionAnalysis);

  const [exerciseId, setExerciseId] = useState<FisiovisionExerciseId>(
    FISIOVISION_ALLOWED_EXERCISES[0],
  );
  const [file, setFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(initialVideoPath ?? null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<FisiovisionAnalysisDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const pollingRef = useRef<{ cancelled: boolean } | null>(null);

  useEffect(() => {
    setVideoPath(initialVideoPath ?? null);
  }, [initialVideoPath]);

  useEffect(() => () => {
    if (pollingRef.current) pollingRef.current.cancelled = true;
  }, []);

  const configError = errorCode === "config_missing";

  const handleFile = useCallback((f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const v = validateMediaFile(f, "video");
    if (!v.ok) {
      toast.error(v.error);
      return;
    }
    setFile(f);
    setErrorMsg(null);
    setErrorCode(null);
  }, []);

  async function uploadIfNeeded(): Promise<string | null> {
    if (videoPath) return videoPath;
    if (!file) {
      toast.error("Selecione um vídeo para análise.");
      return null;
    }
    setUploading(true);
    setUploadPct(0);
    try {
      const path = buildClinicalMediaPath({
        clinicId,
        patientId,
        assessmentId,
        fileName: file.name,
      });
      // Supabase JS não expõe progresso real; simulamos por chunks pequenos.
      setUploadPct(10);
      const { error } = await supabase.storage
        .from(CLINICAL_MEDIA_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600",
        });
      setUploadPct(100);
      if (error) {
        toast.error(`Falha no upload: ${error.message}`);
        return null;
      }
      setVideoPath(path);
      return path;
    } finally {
      setUploading(false);
    }
  }

  async function pollUntilTerminal(id: string) {
    if (pollingRef.current) pollingRef.current.cancelled = true;
    const token = { cancelled: false };
    pollingRef.current = token;

    const start = Date.now();
    let wait = POLL_START_MS;
    while (!token.cancelled) {
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        setErrorMsg("Tempo esgotado aguardando o serviço de análise.");
        return;
      }
      await new Promise((r) => setTimeout(r, wait));
      if (token.cancelled) return;
      try {
        const next = await getFn({ data: { id } });
        setAnalysis(next);
        if (next.status === "completed") {
          onCompleted?.(next);
          toast.success("Análise concluída.");
          return;
        }
        if (next.status === "failed") {
          const code = next.error?.code;
          setErrorCode(code ?? "upstream_error");
          setErrorMsg(next.error?.message ?? translateFisiovisionError(code));
          return;
        }
      } catch (err) {
        const code = extractErrorCode(err);
        setErrorCode(code);
        setErrorMsg(translateFisiovisionError(code));
        if (code === "unauthorized" || code === "forbidden" || code === "not_found") return;
      }
      wait = Math.min(POLL_MAX_MS, Math.round(wait * 1.5));
    }
  }

  async function startAnalysis() {
    setErrorMsg(null);
    setErrorCode(null);
    setAnalysis(null);
    setSubmitting(true);
    try {
      const path = await uploadIfNeeded();
      if (!path) return;
      const created = await createFn({
        data: { exerciseId, videoPath: path, assessmentId, patientId },
      });
      setAnalysis(created);
      if (created.status === "completed") {
        onCompleted?.(created);
        toast.success("Análise concluída.");
        return;
      }
      if (created.status === "failed") {
        const code = created.error?.code;
        setErrorCode(code ?? "upstream_error");
        setErrorMsg(created.error?.message ?? translateFisiovisionError(code));
        return;
      }
      await pollUntilTerminal(created.id);
    } catch (err) {
      const code = extractErrorCode(err);
      setErrorCode(code);
      setErrorMsg(translateFisiovisionError(code));
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setErrorMsg(null);
    setErrorCode(null);
    void startAnalysis();
  }

  const canSubmit = useMemo(() => {
    if (submitting || uploading) return false;
    if (!videoPath && !file) return false;
    return true;
  }, [submitting, uploading, videoPath, file]);

  const badge = analysis ? statusBadge(analysis.status) : null;

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Análise avançada FisioVision</span>
          <Badge variant="outline" className="text-[10px]">
            apoio à decisão — não é diagnóstico
          </Badge>
        </div>
        {badge && (
          <Badge variant={badge.variant} className="text-[10px]">
            {badge.label}
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Exercício</label>
          <Select
            value={exerciseId}
            onValueChange={(v) => setExerciseId(v as FisiovisionExerciseId)}
            disabled={submitting || uploading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FISIOVISION_ALLOWED_EXERCISES.map((id) => (
                <SelectItem key={id} value={id}>
                  {FISIOVISION_EXERCISE_LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Vídeo (MP4, MOV ou WEBM — até 50MB)
          </label>
          {videoPath ? (
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs">
              <span className="truncate text-muted-foreground">Vídeo já enviado.</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={submitting || uploading}
                onClick={() => {
                  setVideoPath(null);
                  setFile(null);
                }}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground hover:bg-background/60">
              <Upload className="h-4 w-4" />
              <span className="truncate">
                {file ? `${file.name} · ${formatBytes(file.size)}` : "Selecionar vídeo"}
              </span>
              <input
                type="file"
                accept={acceptAttrFor("video")}
                className="hidden"
                disabled={submitting || uploading}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="text-[11px] text-muted-foreground">Enviando vídeo…</div>
          <Progress value={uploadPct ?? 0} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={startAnalysis}
          disabled={!canSubmit}
          variant="hero"
          size="sm"
        >
          {submitting || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? "Enviando…" : "Analisando…"}
            </>
          ) : analysis ? (
            "Reanalisar"
          ) : (
            "Enviar para análise"
          )}
        </Button>
        {errorMsg && !submitting && !uploading && (
          <Button type="button" size="sm" variant="outline" onClick={retry}>
            <RefreshCw className="mr-2 h-3 w-3" /> Tentar novamente
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div className="space-y-1">
            <div>{errorMsg}</div>
            {configError && !isPlatformAdmin && (
              <div className="text-muted-foreground">
                Contate o administrador da plataforma para habilitar a análise avançada.
              </div>
            )}
            {configError && isPlatformAdmin && (
              <div className="text-muted-foreground">
                Configure os secrets <code>FISIOVISION_API_URL</code>,{" "}
                <code>FISIOVISION_API_TOKEN</code> e (opcional){" "}
                <code>FISIOVISION_CONSUMER_ID</code> em Project Settings → Secrets.
              </div>
            )}
          </div>
        </div>
      )}

      {analysis?.status === "completed" && analysis.result && (
        <details className="rounded-md border border-border/40 bg-background/40 p-2 text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Resultado bruto (JSON)
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-[11px]">
            {JSON.stringify(analysis.result, null, 2)}
          </pre>
        </details>
      )}

      <p className="text-[11px] text-muted-foreground">
        Estimativa automática — apoio à decisão profissional. Não substitui avaliação clínica.
      </p>
    </div>
  );
}