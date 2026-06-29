import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Se já está logado, redireciona
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/alunos" });
    });
  }, [navigate]);

  const switchMode = (next: "signin" | "signup") => {
    navigate({ to: "/auth", search: { mode: next } });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/alunos`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        navigate({ to: "/alunos" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/alunos" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Falha no login com Google");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return; // browser redirecting
      navigate({ to: "/alunos" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro no Google";
      toast.error(message);
      setGoogleLoading(false);
    }
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
                <Input id="name" name="name" placeholder="Studio Equilibrium" required />
              </Field>
            )}
            <Field id="email" label="E-mail" icon={Mail}>
              <Input id="email" name="email" type="email" placeholder="voce@estudio.com" required autoComplete="email" />
            </Field>
            <Field id="password" label="Senha" icon={Lock}>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={6}
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

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border/60" />
            ou
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continuar com Google
              </>
            )}
          </Button>

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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.8 13-4.8l-6-5c-2 1.4-4.5 2.3-7 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.2l6 5c-.4.4 6.7-4.9 6.7-14.2 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}