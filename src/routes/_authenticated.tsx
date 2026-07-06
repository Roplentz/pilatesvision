import { useEffect, useRef } from "react";
import {
  createFileRoute,
  Outlet,
  Link,
  useRouterState,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { createClinic, setProfileClinic } from "@/lib/clinicsStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ClipboardPlus,
  ScanLine,
  Activity,
  Dumbbell,
  FileText,
  Settings,
  Sparkles,
  Loader2,
  LogOut,
  Shield,
} from "lucide-react";

const menu = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alunos", url: "/alunos", icon: Users },
  { title: "Nova Avaliação", url: "/nova-avaliacao", icon: ClipboardPlus },
  { title: "Avaliação Postural", url: "/avaliacao-postural", icon: ScanLine },
  { title: "Avaliação Dinâmica", url: "/avaliacao-dinamica", icon: Activity },
  { title: "Exercícios Pilates", url: "/exercicios", icon: Dumbbell },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
] as const;

function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-sm font-semibold">PilatesVision</span>
            <span className="text-[10px] text-muted-foreground">Pilates 5.0</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Clínica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin" || pathname.startsWith("/admin/")}
                  >
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AuthedLayout() {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const ensuringRef = useRef(false);

  // Redireciona se a sessão expirar / for revogada em tempo real.
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  // Provisionamento silencioso de "clínica pessoal" para qualquer usuário
  // recém-criado que ainda não tenha clinic_id no perfil. Sem onboarding manual.
  useEffect(() => {
    if (loading || profileLoading || adminLoading || !user || !profile) return;
    if (isAdmin) return;
    if (profile.clinic_id) return;
    if (ensuringRef.current) return;
    ensuringRef.current = true;
    (async () => {
      try {
        const base = (user.email?.split("@")[0] || "Studio").replace(/[^a-zA-Z0-9-]/g, "");
        const slug = `${base.toLowerCase().slice(0, 24) || "studio"}-${user.id.slice(0, 6)}`;
        const clinic = await createClinic({
          name: profile.full_name ? `${profile.full_name} Studio` : `${base || "Meu"} Studio`,
          slug,
          email: user.email ?? null,
          plan: "starter",
          owner_user_id: user.id,
        });
        await setProfileClinic(user.id, clinic.id);
        // Recarrega para que useProfile e os hooks dependentes reabsorvam o clinic_id.
        window.location.reload();
      } catch (err) {
        ensuringRef.current = false;
        toast.error(err instanceof Error ? err.message : "Falha ao inicializar sua conta");
      }
    })();
  }, [loading, profileLoading, adminLoading, isAdmin, user, profile]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  if (loading || profileLoading) {
    return (
      <div className="grid min-h-screen w-full place-items-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Enquanto provisiona a clínica pessoal, mostra um loader curto.
  if (!isAdmin && profile && !profile.clinic_id) {
    return (
      <div className="grid min-h-screen w-full place-items-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          Preparando seu espaço…
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl">
            <SidebarTrigger />
            <span className="font-display text-sm font-medium tracking-tight text-muted-foreground">
              PilatesVision · Movimento inteligente para clínicas de Pilates
            </span>
            <div className="ml-auto flex items-center gap-3">
              {user?.email ? (
                <span className="hidden sm:inline text-xs text-muted-foreground">{user.email}</span>
              ) : null}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
    return { session: data.session, user: data.session.user };
  },
  component: AuthedLayout,
});
