import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Building2, Users, ClipboardCheck, FileText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin | PilatesVision" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

interface Counts {
  clinics: number;
  profiles: number;
  students: number;
  assessments: number;
  reports: number;
}

interface ClinicRow {
  id: string;
  name: string;
  plan: string | null;
  email: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  clinic_id: string | null;
  created_at: string;
}

function AdminPage() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [c, p, s, a, r, cl, pr] = await Promise.all([
        supabase.from("clinics").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("assessments").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("clinics").select("id,name,plan,email,created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("id,full_name,clinic_id,created_at").order("created_at", { ascending: false }).limit(20),
      ]);
      if (cancelled) return;
      setCounts({
        clinics: c.count ?? 0,
        profiles: p.count ?? 0,
        students: s.count ?? 0,
        assessments: a.count ?? 0,
        reports: r.count ?? 0,
      });
      setClinics((cl.data as ClinicRow[] | null) ?? []);
      setProfiles((pr.data as ProfileRow[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (roleLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta área é exclusiva para administradores da plataforma.
        </p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-6">Voltar ao dashboard</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Clínicas", value: counts?.clinics ?? 0, icon: Building2 },
    { label: "Usuários", value: counts?.profiles ?? 0, icon: Users },
    { label: "Alunos", value: counts?.students ?? 0, icon: Users },
    { label: "Avaliações", value: counts?.assessments ?? 0, icon: ClipboardCheck },
    { label: "Relatórios", value: counts?.reports ?? 0, icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-[10px]">Admin</Badge>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Painel administrativo</h1>
          <p className="text-sm text-muted-foreground">Visão global da plataforma PilatesVision</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="bg-surface/60">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold leading-none">
                  {loading ? <Skeleton className="h-7 w-12" /> : s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface/60">
          <CardHeader>
            <CardTitle className="text-base">Clínicas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : clinics.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma clínica cadastrada.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {clinics.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email ?? "—"}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {c.plan ?? "free"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface/60">
          <CardHeader>
            <CardTitle className="text-base">Usuários recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuário.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {profiles.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-medium">{p.full_name ?? "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.clinic_id ? "Vinculado" : "Sem clínica"}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}