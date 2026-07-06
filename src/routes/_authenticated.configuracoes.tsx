import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Loader2, Save, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { updateClinic, useClinic } from "@/lib/clinicsStore";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações | PilatesVision" }] }),
  component: ConfigPage,
});

type Address = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

function ConfigPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { clinic, clinicId, loading: clinicLoading } = useClinic(user?.id);

  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [zip, setZip] = useState("");
  const [savingClinic, setSavingClinic] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? "");
  }, [profile]);

  useEffect(() => {
    if (!clinic) return;
    setName(clinic.name ?? "");
    setEmail(clinic.email ?? "");
    setPhone(clinic.phone ?? "");
    setPlan((clinic.plan as "starter" | "pro" | "enterprise") ?? "starter");
    const addr = (clinic.address ?? null) as Address | null;
    setStreet(addr?.street ?? "");
    setCity(clinic.city ?? addr?.city ?? "");
    setStateUf(clinic.state ?? addr?.state ?? "");
    setZip(addr?.zip ?? "");
  }, [clinic]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado.");
  };

  const saveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId) return;
    if (!name.trim()) {
      toast.error("Informe o nome da clínica.");
      return;
    }
    setSavingClinic(true);
    try {
      const normalizedState = stateUf.trim().toUpperCase() || null;
      await updateClinic(clinicId, {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        plan,
        city: city.trim() || null,
        state: normalizedState,
        address:
          street.trim() || city.trim() || normalizedState || zip.trim()
            ? {
                street: street.trim(),
                city: city.trim(),
                state: normalizedState ?? undefined,
                zip: zip.trim(),
                country: "BR",
              }
            : null,
      });
      toast.success("Clínica atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar clínica.");
    } finally {
      setSavingClinic(false);
    }
  };

  const loading = profileLoading || clinicLoading;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil e os dados da sua clínica.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-primary" /> Perfil
              </CardTitle>
            </CardHeader>
            <form onSubmit={saveProfile}>
              <CardContent className="space-y-4">
                <div>
                  <Label>E-mail</Label>
                  <Input value={user?.email ?? ""} disabled className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="hero" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" /> Salvar perfil
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" /> Dados da clínica
              </CardTitle>
            </CardHeader>
            {!clinic ? (
              <CardContent>
                <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma clínica vinculada ao seu perfil.
                  <div className="mt-4">
                    <Link to="/onboarding">
                      <Button variant="hero">Cadastrar clínica</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={saveClinic}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="cname">Nome *</Label>
                      <Input
                        id="cname"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cemail">E-mail</Label>
                      <Input
                        id="cemail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cphone">Telefone</Label>
                      <Input
                        id="cphone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Plano</Label>
                      <Select
                        value={plan}
                        onValueChange={(v) => setPlan(v as "starter" | "pro" | "enterprise")}
                      >
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
                  </div>

                  <div>
                    <Label htmlFor="street">Endereço</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua e número"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
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
                      <Label htmlFor="uf">UF</Label>
                      <Input
                        id="uf"
                        value={stateUf}
                        onChange={(e) => setStateUf(e.target.value)}
                        maxLength={2}
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

                  <div className="flex justify-end">
                    <Button type="submit" variant="hero" disabled={savingClinic}>
                      {savingClinic && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Save className="h-4 w-4" /> Salvar clínica
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
