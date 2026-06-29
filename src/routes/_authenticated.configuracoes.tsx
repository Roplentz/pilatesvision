import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, FileSignature, ShieldCheck, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações | PilatesVision" }] }),
  component: ConfigPage,
});

const cards = [
  { icon: Building2, title: "Dados da clínica", desc: "Nome, endereço, contato e branding." },
  { icon: Users, title: "Profissionais", desc: "Equipe, especialidades e permissões." },
  { icon: FileText, title: "Preferências de relatório", desc: "Modelos, logo e assinatura clínica." },
  { icon: FileSignature, title: "Termo de consentimento", desc: "Texto exibido ao aluno antes da avaliação." },
  { icon: ShieldCheck, title: "Política de privacidade", desc: "LGPD, retenção e compartilhamento." },
  { icon: CreditCard, title: "Plano atual", desc: "PilatesVision Pro · faturamento mensal." },
];

function ConfigPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua clínica PilatesVision.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="bg-surface/60 transition hover:border-primary/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-primary shadow-glow">
                  <c.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{c.desc}</p>
              <Badge variant="outline">Em breve</Badge>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}