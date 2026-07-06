import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClinic, setProfileClinic } from "@/lib/clinicsStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clinicas/nova")({
  component: NovaClinicaPage,
  head: () => ({
    meta: [{ title: "Nova clínica | PilatesVision" }],
  }),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NovaClinicaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createClinic({
        name: name.trim(),
        slug: slugify(name.trim()),
        email: email.trim() || null,
        phone: phone.trim() || null,
        plan,
        owner_user_id: user?.id ?? null,
        address:
          city || street
            ? {
                street: street.trim(),
                city: city.trim(),
                state: state.trim(),
                zip: zip.trim(),
                country: "BR",
              }
            : null,
      });
      if (user?.id) {
        await setProfileClinic(user.id, created.id);
      }
      toast.success("Clínica cadastrada com sucesso.");
      navigate({ to: "/clinicas/$id", params: { id: created.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cadastrar clínica.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link
            to="/clinicas"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Clínicas
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Novo cadastro
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Cadastrar clínica
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A clínica é vinculada automaticamente ao seu perfil após o cadastro.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome da clínica *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Studio PilatesVision São Paulo"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 ..."
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Plano</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="street">Endereço</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua, número"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                placeholder="SP"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="zip">CEP</Label>
              <Input
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-5">
            <Link to="/clinicas">
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar clínica
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
