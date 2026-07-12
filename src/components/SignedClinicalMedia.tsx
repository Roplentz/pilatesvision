import { AlertCircle, Loader2 } from "lucide-react";
import { useSignedMediaUrl } from "@/lib/mediaStorage";

interface Props {
  path: string | null | undefined;
  kind: "video" | "image";
  className?: string;
  alt?: string;
}

export function SignedClinicalMedia({ path, kind, className, alt }: Props) {
  const { url, loading, error } = useSignedMediaUrl(path);

  if (!path) return null;

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground ${className ?? ""}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando mídia…
      </div>
    );
  }

  if (error || !url) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive ${className ?? ""}`}
      >
        <AlertCircle className="h-4 w-4" />
        Não foi possível carregar a mídia.
      </div>
    );
  }

  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className={`w-full max-h-[520px] rounded-lg border border-border/60 bg-black ${className ?? ""}`}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt ?? "Imagem clínica"}
      className={`w-full max-h-[520px] rounded-lg border border-border/60 object-contain bg-black/40 ${className ?? ""}`}
    />
  );
}
