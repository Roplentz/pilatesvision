import { useEffect } from "react";
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
                const active =
                  pathname === item.url || pathname.startsWith(item.url + "/");
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Redireciona se a sessão expirar / for revogada em tempo real.
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  // Onboarding: usuário sem clínica vinculada é levado para /onboarding.
  useEffect(() => {
    if (loading || profileLoading || adminLoading || !user) return;
    // Admins não precisam de clínica vinculada.
    if (isAdmin) return;
    const needsOnboarding = profile && !profile.clinic_id;
    if (needsOnboarding && pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [loading, profileLoading, adminLoading, isAdmin, user, profile, pathname, navigate]);

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

  // Em onboarding: esconde sidebar e header padrão para um fluxo focado.
  if (pathname === "/onboarding") {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        <header className="flex h-12 items-center justify-end border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
          {user?.email && (
            <span className="hidden sm:inline text-xs text-muted-foreground mr-3">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Button>
        </header>
        <Outlet />
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
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 gap-1.5"
              >
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