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

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — PilatesVision" },
      {
        name: "description",
        content: "Acesse sua conta PilatesVision ou crie um estúdio em minutos.",
      },
      { property: "og:title", content: "Entrar — PilatesVision" },
      { property: "og:description", content: "Acesse sua conta PilatesVision ou crie um estúdio." },
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
  const isForgot = mode === "forgot";
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [forgotSent, setForgotSent] = useState(false);

  const destination =
    search.redirect && search.redirect.startsWith("/") ? search.redirect : "/dashboard";

  // Se já está logado, redireciona. Também escuta mudanças de auth.
  useEffect(() => {
    let mounted = true;
    // No fluxo "esqueci minha senha" não redirecionamos automaticamente,
    // porque o usuário pode estar autenticado por token de recuperação.
    if (isForgot) {
      setCheckingSession(false);
      return () => {
        mounted = false;
      };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        navigate({ to: destination, replace: true });
      } else {
        setCheckingSession(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: destination, replace: true });
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, destination, isForgot]);

  const switchMode = (next: "signin" | "signup" | "forgot") => {
    navigate({ to: "/auth", search: { mode: next } });
  };

  const onForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      // Mensagem neutra — não confirmamos existência do e-mail.
      setForgotSent(true);
      toast.success("Se o e-mail existir, enviaremos as instruções.");
    } catch {
      // Mesma mensagem neutra em caso de erro do provedor.
      setForgotSent(true);
      toast.success("Se o e-mail existir, enviaremos as instruções.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!email || !password) {
      toast.error("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${destination}`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada!");
          navigate({ to: destination, replace: true });
        } else {
          toast.success("Conta criada! Confirme seu e-mail para entrar.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: destination, replace: true });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Erro ao autenticar";
      const friendly = /invalid login credentials/i.test(raw)
        ? "E-mail ou senha incorretos."
        : /email not confirmed/i.test(raw)
          ? "Confirme seu e-mail antes de entrar."
          : /user already registered/i.test(raw)
            ? "Já existe uma conta com este e-mail. Entre com sua senha."
            : raw;
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="grid min-h-screen w-full place-items-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
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
          {!isForgot && (
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-background/60 p-1 text-sm">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-md px-3 py-2 transition ${
                !isSignup
                  ? "bg-surface-elevated text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-md px-3 py-2 transition ${
                isSignup
                  ? "bg-surface-elevated text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>
          )}

          {isForgot ? (
            forgotSent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Se o e-mail informado existir em nossa base, enviaremos um link
                  para redefinir a senha. Verifique também a caixa de spam.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => switchMode("signin")}
                >
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={onForgotSubmit} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Informe o e-mail cadastrado e enviaremos um link seguro para
                  redefinir sua senha.
                </p>
                <Field id="email" label="E-mail" icon={Mail}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="voce@estudio.com"
                    required
                    autoComplete="email"
                  />
                </Field>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link"}
                </Button>
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Voltar para o login
                </button>
              </form>
            )
          ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
              <Field id="name" label="Nome do estúdio" icon={User}>
                <Input id="name" name="name" placeholder="Studio Equilibrium" required />
              </Field>
            )}
            <Field id="email" label="E-mail" icon={Mail}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@estudio.com"
                required
                autoComplete="email"
              />
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
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Esqueci minha senha
                </button>
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
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar você concorda com nossos{" "}
            <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">
              Termos
            </a>{" "}
            e{" "}
            <a href="#" className="underline-offset-2 hover:text-foreground hover:underline">
              Política de Privacidade
            </a>
            .
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
