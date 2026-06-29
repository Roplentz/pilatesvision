import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
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
} from "lucide-react";

const menu = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alunos", url: "/alunos", icon: Users },
  { title: "Nova Avaliação", url: "/nova-avaliacao", icon: ClipboardPlus },
  { title: "Avaliação Postural", url: "/postural", icon: ScanLine },
  { title: "Avaliação Dinâmica", url: "/dinamica", icon: Activity },
  { title: "Exercícios Pilates", url: "/exercicios", icon: Dumbbell },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
] as const;

function AppSidebar() {
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AuthedLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl">
            <SidebarTrigger />
            <span className="font-display text-sm font-medium tracking-tight text-muted-foreground">
              PilatesVision · Movimento inteligente para clínicas de Pilates
            </span>
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
  component: AuthedLayout,
});