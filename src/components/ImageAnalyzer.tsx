import { useRef, useState } from "react";
import { Loader2, Upload, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AnalysisMode = "postural" | "dinamica" | "exercicio";

interface ImageAnalyzerProps {
  mode: AnalysisMode;
  context?: string;
  label?: string;
  compact?: boolean;
}

export function ImageAnalyzer({ mode, context, label, compact }: ImageAnalyzerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = () => fileRef.current?.click();

  const analyze = async (dataUrl: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mode, context }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Erro ${res.status}`);
      const json = JSON.parse(text) as { analysis: string };
      setAnalysis(json.analysis);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const onFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem (JPG/PNG/WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem acima de 8 MB. Reduza o tamanho.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPreview(url);
      void analyze(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />

      {preview ? (
        <img
          src={preview}
          alt={label ?? "Imagem para análise"}
          className={`w-full rounded-md border border-border/60 object-cover ${compact ? "max-h-52" : "max-h-72"}`}
        />
      ) : (
        <button
          type="button"
          onClick={pick}
          className={`grid w-full place-items-center rounded-md border border-dashed border-border/60 bg-background/40 text-muted-foreground transition hover:text-foreground ${compact ? "h-40" : "h-44"}`}
        >
          <div className="flex flex-col items-center gap-2 text-xs">
            <Upload className="h-6 w-6 opacity-70" />
            {label ?? "Enviar imagem para análise"}
          </div>
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={pick} disabled={loading}>
          <Upload className="mr-1 h-3.5 w-3.5" />
          {preview ? "Trocar imagem" : "Selecionar imagem"}
        </Button>
        {preview && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => analyze(preview)}
            disabled={loading}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Reanalisar
          </Button>
        )}
        {loading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Analisando…
          </span>
        )}
      </div>

      {analysis && (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Análise IA
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{analysis}</div>
        </div>
      )}
    </div>
  );
}
