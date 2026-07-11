import { useRef, useState } from "react";
import { Film, ImageIcon, Loader2, ShieldAlert, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  acceptAttrFor,
  formatBytes,
  uploadClinicalMedia,
  validateMediaFile,
  type MediaKind,
} from "@/lib/mediaStorage";

interface Props {
  kind: MediaKind;
  clinicId: string;
  patientId: string;
  assessmentId: string;
  currentPath?: string | null;
  disabled?: boolean;
  onUploaded: (path: string) => void | Promise<void>;
  onCleared?: () => void;
  label?: string;
  /** Se false/undefined, o upload fica bloqueado por falta de consentimento de uso de imagem. */
  consentImageUse?: boolean;
  /** Rota do paciente para o profissional registrar/atualizar o consentimento. */
  patientHref?: string;
}

export function ClinicalMediaUploader({
  kind,
  clinicId,
  patientId,
  assessmentId,
  currentPath,
  disabled,
  onUploaded,
  onCleared,
  label,
  consentImageUse,
  patientHref,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const Icon = kind === "video" ? Film : ImageIcon;
  const defaultLabel =
    kind === "video" ? "Vídeo do movimento (opcional)" : "Imagem postural (opcional)";

  const consentBlocked = !consentImageUse;

  async function handleFile(file: File) {
    setError(null);
    if (consentBlocked) {
      setError(
        "Registre o consentimento de uso de imagem antes de anexar mídia clínica.",
      );
      return;
    }
    const v = validateMediaFile(file, kind);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    setSelectedName(`${file.name} · ${formatBytes(file.size)}`);
    setUploading(true);
    try {
      const { path } = await uploadClinicalMedia({
        file,
        clinicId,
        patientId,
        assessmentId,
        kind,
      });
      await onUploaded(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-background/40 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-border/60 bg-card/60 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{label ?? defaultLabel}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {kind === "video"
              ? "MP4, MOV ou WEBM · até 50MB."
              : "JPG, PNG ou WEBP · até 50MB."}
          </p>

          {currentPath && !uploading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-500">
              <UploadCloud className="h-3.5 w-3.5" /> Arquivo anexado.
              {onCleared && !disabled && (
                <button
                  type="button"
                  onClick={() => onCleared()}
                  className="ml-1 inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" /> remover
                </button>
              )}
            </div>
          )}

          {selectedName && uploading && (
            <div className="mt-2 text-xs text-muted-foreground">{selectedName}</div>
          )}

          {uploading && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-border/40">
              <div className="h-full w-1/2 animate-pulse rounded bg-primary/70" />
            </div>
          )}

          {consentBlocked && (
            <div
              role="status"
              className="mt-2 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-600 dark:text-amber-300"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <div className="space-y-1">
                <div>
                  Registre o consentimento de uso de imagem antes de anexar mídia clínica.
                </div>
                {patientHref && (
                  <a
                    href={patientHref}
                    className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
                  >
                    Registrar consentimento
                  </a>
                )}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttrFor(kind)}
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading || consentBlocked}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {currentPath ? "Substituir" : "Selecionar arquivo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}