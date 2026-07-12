import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePatientConsent, savePatientConsent, CONSENT_TEXT_V1 } from "@/lib/patientConsentsStore";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  patientId: string;
  clinicId: string;
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function PatientConsentCard({ patientId, clinicId }: Props) {
  const { profile } = useProfile();
  const { consent, loading, reload } = usePatientConsent(patientId);
  const [lgpd, setLgpd] = useState(false);
  const [image, setImage] = useState(false);
  const [ai, setAi] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLgpd(consent?.consent_lgpd ?? false);
    setImage(consent?.consent_image_use ?? false);
    setAi(consent?.consent_ai_support ?? false);
  }, [consent?.id, consent?.consent_lgpd, consent?.consent_image_use, consent?.consent_ai_support]);

  const imageOk = Boolean(consent?.consent_image_use);

  async function save() {
    setSaving(true);
    try {
      await savePatientConsent({
        patientId,
        clinicId,
        professionalId: profile?.id ?? null,
        consentLgpd: lgpd,
        consentImageUse: image,
        consentAiSupport: ai,
        existingId: consent?.id ?? null,
      });
      toast.success("Consentimento registrado.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao registrar consentimento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="consentimento" className="rounded-xl border border-border/60 bg-card/40 p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {imageOk ? (
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          )}
          <div>
            <h2 className="text-sm font-semibold">Consentimento (LGPD)</h2>
            <p className="text-xs text-muted-foreground">
              Necessário antes de anexar imagens ou vídeos do paciente.
            </p>
          </div>
        </div>
        {consent && (
          <div className="text-right text-[11px] text-muted-foreground">
            <div>Última atualização</div>
            <div>{fmt(consent.accepted_at ?? consent.updated_at)}</div>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="space-y-3">
          <p className="rounded-md border border-border/50 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {CONSENT_TEXT_V1}
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={lgpd}
                onCheckedChange={(v) => setLgpd(Boolean(v))}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Consentimento LGPD geral</span>
                <span className="block text-xs text-muted-foreground">
                  Autoriza o tratamento dos dados clínicos pela clínica.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={image}
                onCheckedChange={(v) => setImage(Boolean(v))}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Uso de imagem e vídeo (dados biométricos)</span>
                <span className="block text-xs text-muted-foreground">
                  Necessário para anexar fotos/vídeos em avaliações.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={ai}
                onCheckedChange={(v) => setAi(Boolean(v))}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Apoio por análise automática</span>
                <span className="block text-xs text-muted-foreground">
                  Autoriza uso de ferramentas de apoio à decisão (não substitui o profissional).
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-muted-foreground">
              {imageOk ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uso de imagem autorizado.
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Uso de imagem ainda não autorizado — upload de mídia bloqueado.
                </span>
              )}
            </div>
            <Button size="sm" variant="hero" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar consentimento
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
