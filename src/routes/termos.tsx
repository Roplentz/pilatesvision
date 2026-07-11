import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — PilatesVision" },
      {
        name: "description",
        content:
          "Termos de uso do PilatesVision — ferramenta de apoio à decisão clínica.",
      },
      { property: "og:title", content: "Termos de Uso — PilatesVision" },
      {
        property: "og:description",
        content: "Regras de uso do PilatesVision para profissionais habilitados.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <header className="mt-8 space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="text-xs text-muted-foreground">
            Esta página é mantida pelo responsável pelo PilatesVision. Não
            constitui aconselhamento jurídico.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <Section n="1" title="Aceite">
            Ao criar conta, o profissional declara ter lido e aceitado estes
            Termos e a Política de Privacidade.
          </Section>
          <Section n="2" title="Natureza do serviço">
            O PilatesVision é ferramenta de APOIO À DECISÃO e documentação;
            não substitui avaliação clínica presencial, diagnóstico médico nem
            o julgamento do profissional habilitado. Todo indicador exige
            confirmação profissional.
          </Section>
          <Section n="3" title="Responsabilidades do profissional">
            Garantir habilitação legal (CREFITO/CREF), obter consentimento dos
            pacientes, inserir dados verídicos e usar o sistema conforme a
            ética profissional.
          </Section>
          <Section n="4" title="Uso adequado">
            Proibido uso para fins ilícitos, upload de conteúdo de terceiros
            sem autorização, ou tentativa de burlar controles de segurança.
          </Section>
          <Section n="5" title="Propriedade e dados">
            Os dados de pacientes pertencem à clínica (Controladora); o
            PilatesVision não reivindica propriedade sobre eles.
          </Section>
          <Section n="6" title="Limitação de responsabilidade">
            O serviço é fornecido &quot;no estado em que se encontra&quot;;
            decisões clínicas são de responsabilidade exclusiva do
            profissional.
          </Section>
          <Section n="7" title="Suspensão/encerramento">
            Conta pode ser suspensa por violação destes Termos; o titular pode
            encerrar a conta e solicitar exclusão dos dados.
          </Section>
          <Section n="8" title="Foro e legislação">
            Legislação brasileira.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {n}. {title}
      </h2>
      <p className="text-sm text-muted-foreground">{children}</p>
    </section>
  );
}