import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-pilates.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PilatesVision — Avaliação de Pilates por Visão Computacional" },
      {
        name: "description",
        content:
          "IA que filma, analisa e devolve avaliações posturais e biomecânicas precisas para estúdios de Pilates em segundos.",
      },
      { property: "og:title", content: "PilatesVision — IA para avaliação de Pilates" },
      {
        property: "og:description",
        content:
          "Avaliações posturais automatizadas, prontuário digital de alunos e relatórios clínicos para estúdios de Pilates.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: ScanLine,
    title: "Pose estimation 3D",
    desc: "Captura 33 pontos articulares em tempo real direto do celular — sem marcadores, sem sensores.",
  },
  {
    icon: BarChart3,
    title: "Relatórios clínicos",
    desc: "Ângulos, simetria, amplitude e desvios posturais entregues em PDF pronto para o aluno.",
  },
  {
    icon: Users,
    title: "Prontuário do aluno",
    desc: "Histórico de avaliações, evolução por sessão e anotações clínicas em um só lugar.",
  },
  {
    icon: ShieldCheck,
    title: "LGPD por padrão",
    desc: "Dados de saúde criptografados, consentimento digital e exportação a qualquer momento.",
  },
];

const steps = [
  { n: "01", title: "Filme", desc: "Aluno faz a pose. Você grava pelo app." },
  { n: "02", title: "Analise", desc: "A IA processa o vídeo em segundos." },
  { n: "03", title: "Entregue", desc: "Relatório clínico assinado pelo estúdio." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">PilatesVision</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#produto" className="transition hover:text-foreground">Produto</a>
          <a href="#como-funciona" className="transition hover:text-foreground">Como funciona</a>
          <a href="#precos" className="transition hover:text-foreground">Planos</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="hero" size="sm">
              Começar
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
      <Activity className="h-4 w-4 text-primary-foreground" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Pilates 5.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            Movimento inteligente{" "}
            <span className="text-gradient">para clínicas de Pilates.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            A PilatesVision usa visão computacional para transformar um vídeo de celular em
            laudo biomecânico completo. Pensada para o seu estúdio, do anamnese ao relatório.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                Entrar no app
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg">
                Ver como funciona
              </Button>
            </a>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />14 dias grátis</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Sem cartão</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />LGPD compliant</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-elevated">
            <img
              src={heroImage}
              alt="Análise biomecânica de Pilates por IA"
              width={1536}
              height={1280}
              className="h-full w-full object-cover"
            />
            <FloatingStat
              className="left-4 top-4"
              label="Simetria pélvica"
              value="94%"
            />
            <FloatingStat
              className="bottom-4 right-4"
              label="Ângulo de flexão"
              value="127°"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className={`absolute rounded-xl border border-border/60 bg-background/80 px-3 py-2 backdrop-blur-md ${className ?? ""}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-semibold text-foreground">{value}</div>
    </motion.div>
  );
}

function Logos() {
  const names = ["Studio Equilibrium", "Core Pilates", "Movimento+", "Aria Studio", "Pilates Lab"];
  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-8 text-sm text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">Confiado por estúdios em todo Brasil</span>
        {names.map((n) => (
          <span key={n} className="font-display text-base text-muted-foreground/80">{n}</span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="produto" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Produto</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Um sistema operacional para o seu estúdio.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Da avaliação inicial à evolução do aluno — tudo em uma plataforma única,
          desenhada para a rotina clínica do Pilates.
        </p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-surface p-6 transition hover:border-primary/50"
          >
            <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/30">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="relative border-t border-border/60 bg-surface/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Como funciona</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Três passos. Uma câmera.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Sem hardware especial, sem marcadores. Funciona em qualquer celular
            moderno — basta abrir o app e gravar.
          </p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-surface p-8">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="precos" className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface px-8 py-16 text-center shadow-elevated md:px-16">
        <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Pronto para fazer avaliações que impressionam?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Crie sua conta e faça a primeira avaliação ainda hoje.
            Sem instalação, sem hardware.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button variant="hero" size="lg">
                Começar grátis
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">Já tenho conta</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display font-medium text-foreground">PilatesVision</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="transition hover:text-foreground">Privacidade</a>
          <a href="#" className="transition hover:text-foreground">Termos</a>
          <a href="#" className="transition hover:text-foreground">Contato</a>
        </div>
      </div>
    </footer>
  );
}
