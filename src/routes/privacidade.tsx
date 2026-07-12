import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — PilatesVision" },
      {
        name: "description",
        content:
          "Como o PilatesVision trata dados pessoais de profissionais e pacientes em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — PilatesVision" },
      {
        property: "og:description",
        content: "Tratamento de dados pessoais conforme a LGPD.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
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
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: [data]. Controlador: [Razão social / responsável], [CNPJ/CPF].
            Contato do Encarregado (DPO): [e-mail].
          </p>
          <p className="text-xs text-muted-foreground">
            Esta página é mantida pelo responsável pelo PilatesVision para informar profissionais e
            pacientes sobre o tratamento de dados pessoais. Não constitui certificação independente.
          </p>
        </header>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <Section n="1" title="Objeto">
            Esta Política descreve como o PilatesVision trata dados pessoais de profissionais e de
            pacientes/alunos, em conformidade com a LGPD (Lei 13.709/2018).
          </Section>
          <Section n="2" title="Dados tratados">
            Dados cadastrais do profissional e da clínica; dados de pacientes inseridos pelo
            profissional (identificação, dados clínicos de avaliação); e, quando houver
            consentimento específico, imagens/vídeos (dado biométrico sensível, Art. 11).
          </Section>
          <Section n="3" title="Finalidade">
            Apoio à decisão profissional, geração de relatórios e acompanhamento evolutivo. O
            sistema NÃO substitui avaliação clínica nem fornece diagnóstico.
          </Section>
          <Section n="4" title="Bases legais">
            Execução de contrato e legítimo interesse para dados cadastrais; consentimento
            específico e destacado para dados sensíveis/imagem (Art. 7 e 11).
          </Section>
          <Section n="5" title="Papéis">
            A clínica/profissional é a Controladora dos dados de seus pacientes; o PilatesVision
            atua como Operador, tratando os dados sob instrução da clínica.
          </Section>
          <Section n="6" title="Compartilhamento">
            Dados hospedados em provedores de nuvem (Supabase) sob contrato; não vendemos dados; não
            há compartilhamento com terceiros para fins de marketing.
          </Section>
          <Section n="7" title="Armazenamento e segurança">
            Isolamento por clínica (RLS), armazenamento de mídia em bucket privado, criptografia em
            trânsito, controle de acesso. Retenção conforme necessidade da finalidade e obrigações
            legais; descarte seguro ao fim.
          </Section>
          <Section n="8" title="Direitos do titular (Art. 18)">
            Confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre
            compartilhamento e revogação de consentimento. Solicitações via [e-mail do DPO].
          </Section>
          <Section n="9" title="Consentimento de imagem">
            Imagens/vídeos só são coletados após consentimento específico registrado; o titular pode
            revogá-lo a qualquer tempo.
          </Section>
          <Section n="10" title="Cookies">
            Uso essencial para autenticação e funcionamento; sem rastreamento publicitário.
          </Section>
          <Section n="11" title="Alterações">
            Esta Política pode ser atualizada; a data de vigência é indicada no topo.
          </Section>

          <p className="rounded-md border border-border/60 bg-surface/40 p-4 text-xs text-muted-foreground">
            Contato do Encarregado (DPO): [e-mail].
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {n}. {title}
      </h2>
      <p className="text-sm text-muted-foreground">{children}</p>
    </section>
  );
}
