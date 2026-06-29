import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createClinic, setProfileClinic } from "@/lib/clinicsStore";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Bem-vindo | PilatesVision" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) { toast.error("Informe o nome da clínica."); return; }
    setSubmitting(true);
    try {
      const created = await createClinic({
        name: name.trim(),
        owner_user_id: user.id,
        city: city.trim() || null,
        state: stateUf.trim() || null,
      });
      await setProfileClinic(user.id, created.id);
      toast.success("Clínica criada. Bem-vindo!");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar clínica.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center justify-center px-6 py-10">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Bem-vindo ao PilatesVision
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Vamos configurar sua clínica
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esses dados aparecem em relatórios e prontuários. Você pode ajustar depois em Configurações.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-medium">Dados da clínica</div>
              <div className="text-xs text-muted-foreground">Obrigatório para começar a usar o app.</div>
            </div>
          </div>
          <div>
            <Label htmlFor="cname">Nome da clínica *</Label>
            <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="mt-1.5" placeholder="Ex: Studio PilatesVision" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" placeholder="Porto Alegre" />
            </div>
            <div>
              <Label htmlFor="state">UF</Label>
              <Input id="state" value={stateUf} onChange={(e) => setStateUf(e.target.value)} className="mt-1.5" placeholder="RS" maxLength={2} />
            </div>
          </div>
          <Button type="submit" disabled={submitting || !name.trim()} className="w-full" variant="hero">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : "Criar clínica e continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
