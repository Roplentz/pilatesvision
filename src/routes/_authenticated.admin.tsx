import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsPlatformAdmin } from "@/hooks/useIsPlatformAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  RefreshCw,
  Video,
  Activity,
  CalendarRange,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Controle da Plataforma | PilatesVision" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface Overview {
  gerado_em: string;
  totais: {
    clinicas: number;
    profissionais: number;
    pacientes: number;
    pacientes_ativos: number;
    avaliacoes: number;
    avaliacoes_finalizadas: number;
    relatorios: number;
    relatorios_finalizados: number;
    relatorios_mes: number;
  };
  adocao_video: {
    movimento_com_video: number;
    exercicio_com_video: number;
    com_analise: number;
  };
  por_clinica: Array<{
    clinic_id: string;
    clinica: string;
    pacientes: number;
    avaliacoes: number;
    relatorios: number;
  }>;
}

function AdminPage() {
  const { isPlatformAdmin, loading: roleLoading } = useIsPlatformAdmin();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("platform_overview");
    if (error) {
      setError(error.message);
      setOverview(null);
    } else {
      setOverview(data as unknown as Overview);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    void load();
  }, [isPlatformAdmin, load]);

  if (roleLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Área exclusiva do administrador da plataforma.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6">
            Voltar ao dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const t = overview?.totais;
  const v = overview?.adocao_video;

  const stats = [
    { label: "Clínicas", value: t?.clinicas ?? 0, icon: Building2 },
    { label: "Profissionais", value: t?.profissionais ?? 0, icon: Users },
    {
      label: "Pacientes",
      value: t?.pacientes ?? 0,
      hint: t ? `${t.pacientes_ativos} ativos` : undefined,
      icon: Users,
    },
    {
      label: "Avaliações",
      value: t?.avaliacoes ?? 0,
      hint: t ? `${t.avaliacoes_finalizadas} finalizadas` : undefined,
      icon: ClipboardCheck,
    },
    {
      label: "Relatórios",
      value: t?.relatorios ?? 0,
      hint: t ? `${t.relatorios_finalizados} finalizados` : undefined,
      icon: FileText,
    },
    {
      label: "Relatórios no mês",
      value: t?.relatorios_mes ?? 0,
      icon: CalendarRange,
    },
  ];

  const adocao = [
    { label: "Vídeos de movimento", value: v?.movimento_com_video ?? 0, icon: Video },
    { label: "Vídeos de exercício", value: v?.exercicio_com_video ?? 0, icon: Video },
    { label: "Avaliações com análise biomecânica", value: v?.com_analise ?? 0, icon: Activity },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-[10px]">
              Plataforma
            </Badge>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Controle da Plataforma
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão agregada de todas as clínicas — acesso exclusivo do administrador.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overview?.gerado_em ? (
            <span className="text-xs text-muted-foreground">
              Atualizado em {new Date(overview.gerado_em).toLocaleString("pt-BR")}
            </span>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </header>

      {error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-surface/60">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-semibold leading-none">
                  {loading && !overview ? <Skeleton className="h-7 w-12" /> : s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                {s.hint ? (
                  <div className="text-[10px] text-muted-foreground/80">{s.hint}</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="bg-surface/60">
          <CardHeader>
            <CardTitle className="text-base">Adoção do diferencial</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {adocao.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-semibold leading-none">
                    {loading && !overview ? <Skeleton className="h-6 w-10" /> : a.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.label}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-surface/60">
          <CardHeader>
            <CardTitle className="text-base">Por clínica</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !overview ? (
              <Skeleton className="h-32 w-full" />
            ) : !overview || overview.por_clinica.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma clínica registrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clínica</TableHead>
                    <TableHead className="text-right">Pacientes</TableHead>
                    <TableHead className="text-right">Avaliações</TableHead>
                    <TableHead className="text-right">Relatórios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.por_clinica.map((row) => (
                    <TableRow key={row.clinic_id}>
                      <TableCell className="font-medium">{row.clinica}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.pacientes}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.avaliacoes}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.relatorios}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
