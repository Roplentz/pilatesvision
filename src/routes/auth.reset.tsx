import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({
    meta: [{ title: "Redefinir senha — PilatesVision" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Aguarda o Supabase processar o token de recuperação do link do e-mail
  // (detectSessionInUrl) e emite PASSWORD_RECOVERY. Também aceita sessão
  // já ativa proveniente do fluxo de recovery.
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setCanReset(true);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setCanReset(true);
      setReady(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setDone(true);
      toast.success("Senha redefinida. Faça login com a nova senha.");
      setTimeout(() => {
        navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
      }, 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link
          to="/auth"
          search={{ mode: "signin" }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <div className="mt-12 flex flex-col items-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
            Redefinir senha
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Defina uma nova senha para acessar sua conta.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-surface/80 p-6 shadow-elevated backdrop-blur">
          {!ready ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : done ? (
            <p className="text-center text-sm text-muted-foreground">
              Senha atualizada com sucesso. Redirecionando para o login…
            </p>
          ) : !canReset ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Este link de redefinição é inválido ou expirou. Solicite um novo link para
                continuar.
              </p>
              <Button asChild variant="hero" size="lg" className="w-full">
                <Link to="/auth" search={{ mode: "forgot" }}>
                  Solicitar novo link
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <PasswordField
                id="password"
                name="password"
                label="Nova senha"
                autoComplete="new-password"
              />
              <PasswordField
                id="confirm"
                name="confirm"
                label="Confirmar nova senha"
                autoComplete="new-password"
              />
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redefinir senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          name={name}
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={autoComplete}
          className="h-11 border-border/60 bg-background/60 pl-9"
        />
      </div>
    </div>
  );
}
