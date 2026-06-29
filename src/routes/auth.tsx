import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Kinetik" },
      { name: "description", content: "Acesse sua conta Kinetik ou crie um estúdio em minutos." },
      { property: "og:title", content: "Entrar — Kinetik" },
      { property: "og:description", content: "Acesse sua conta Kinetik ou crie um estúdio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const mode = search.mode ?? "signin";
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);

  const switchMode = (next: "signin" | "signup") => {
    navigate({ to: "/auth", search: { mode: next } });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrar com Lovable Cloud quando o backend for ativado.
    setTimeout(() => setLoading(false), 900);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex flex-col items-center"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
            {isSignup ? "Crie seu estúdio" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isSignup
              ? "14 dias grátis. Sem cartão. Cancele quando quiser."
              : "Entre com seu e-mail e senha."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 rounded-2xl border border-border/60 bg-surface/80 p-6 shadow-elevated backdrop-blur"
        >
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-background/60 p-1 text-sm">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-md px-3 py-2 transition ${
                !isSignup ? "bg-surface-elevated text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-md px-3 py-2 transition ${
                isSignup ? "bg-surface-elevated text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
              <Field id="name" label="Nome do estúdio" icon={User}>
                <Input id="name" placeholder="Studio Equilibrium" required />
              </Field>
            )}
            <Field id="email" label="E-mail" icon={Mail}>
              <Input id="email" type="email" placeholder="voce@estudio.com" required autoComplete="email" />
            </Field>
            <Field id="password" label="Senha" icon={Lock}>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
              />
            </Field>

            {!isSignup && (
              <div className="flex justify-end">
                <a href="#" className="text-xs text-muted-foreground transition hover:text-foreground">
                  Esqueci minha senha
                </a>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignup ? (
                "Criar conta"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar você concorda com nossos{" "}
            <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">Termos</a>{" "}
            e{" "}
            <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">Política de Privacidade</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <div className="[&_input]:pl-9 [&_input]:bg-background/60 [&_input]:border-border/60 [&_input]:h-11">
          {children}
        </div>
      </div>
    </div>
  );
}