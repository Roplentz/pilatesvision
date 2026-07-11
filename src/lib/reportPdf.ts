import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import {
  ASSESSMENT_TYPE_LABEL,
  REPORT_DISCLAIMER,
  SEVERITY_LABEL,
  SUPPORT_LEVEL_LABEL,
  type ReportJson,
} from "@/lib/reportsStore";

const MARGIN = 48;
const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

type Ctx = {
  doc: jsPDF;
  y: number;
  clinicName: string;
  generatedAt: string;
};

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y + needed > PAGE_H - MARGIN - 40) {
    addFooter(ctx);
    ctx.doc.addPage();
    ctx.y = MARGIN;
  }
}

function addFooter(ctx: Ctx) {
  const { doc } = ctx;
  const page = doc.getCurrentPageInfo().pageNumber;
  const total = doc.getNumberOfPages();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  const footerY = PAGE_H - MARGIN + 16;
  doc.text(
    `${ctx.clinicName} · Relatório de apoio à decisão profissional`,
    MARGIN,
    footerY,
  );
  doc.text(
    `${ctx.generatedAt} · pág. ${page}/${total}`,
    PAGE_W - MARGIN,
    footerY,
    { align: "right" },
  );
  doc.setTextColor(0);
}

function stampAllFooters(ctx: Ctx) {
  const { doc } = ctx;
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    const footerY = PAGE_H - MARGIN + 16;
    doc.text(
      `${ctx.clinicName} · Relatório de apoio à decisão profissional`,
      MARGIN,
      footerY,
    );
    doc.text(
      `${ctx.generatedAt} · pág. ${i}/${total}`,
      PAGE_W - MARGIN,
      footerY,
      { align: "right" },
    );
    doc.setTextColor(0);
  }
}

function heading(ctx: Ctx, number: string, title: string) {
  ensureSpace(ctx, 46);
  const { doc } = ctx;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 200);
  doc.text(number, MARGIN, ctx.y);
  doc.setTextColor(20);
  doc.setFontSize(14);
  doc.text(title, MARGIN + 28, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(220);
  doc.line(MARGIN, ctx.y, PAGE_W - MARGIN, ctx.y);
  ctx.y += 14;
}

function paragraph(ctx: Ctx, text: string, opts: { size?: number; muted?: boolean; italic?: boolean } = {}) {
  if (!text) return;
  const { doc } = ctx;
  const size = opts.size ?? 10.5;
  doc.setFont("helvetica", opts.italic ? "italic" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(opts.muted ? 110 : 30);
  const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
  const lh = size * 1.35;
  for (const line of lines) {
    ensureSpace(ctx, lh);
    doc.text(line, MARGIN, ctx.y);
    ctx.y += lh;
  }
  doc.setTextColor(0);
}

function keyValueGrid(ctx: Ctx, items: Array<{ label: string; value: string }>) {
  const { doc } = ctx;
  const colW = CONTENT_W / 2;
  const rowH = 34;
  for (let i = 0; i < items.length; i += 2) {
    ensureSpace(ctx, rowH);
    for (let c = 0; c < 2; c++) {
      const it = items[i + c];
      if (!it) continue;
      const x = MARGIN + c * colW;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(it.label.toUpperCase(), x, ctx.y);
      doc.setFontSize(10.5);
      doc.setTextColor(20);
      const lines = doc.splitTextToSize(it.value || "—", colW - 12) as string[];
      doc.text(lines[0] ?? "—", x, ctx.y + 14);
    }
    ctx.y += rowH;
  }
  doc.setTextColor(0);
}

function bullet(ctx: Ctx, text: string) {
  if (!text) return;
  const { doc } = ctx;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(text, CONTENT_W - 14) as string[];
  const lh = 10.5 * 1.35;
  ensureSpace(ctx, lh);
  doc.setTextColor(90, 90, 200);
  doc.text("•", MARGIN, ctx.y);
  doc.setTextColor(30);
  doc.text(lines[0], MARGIN + 12, ctx.y);
  ctx.y += lh;
  for (let i = 1; i < lines.length; i++) {
    ensureSpace(ctx, lh);
    doc.text(lines[i], MARGIN + 12, ctx.y);
    ctx.y += lh;
  }
  doc.setTextColor(0);
}

function footnote(ctx: Ctx, text: string) {
  ctx.y += 4;
  paragraph(ctx, text, { size: 8.5, italic: true, muted: true });
  ctx.y += 4;
}

function drawHeader(ctx: Ctx, json: ReportJson, title: string) {
  const { doc } = ctx;
  doc.setFillColor(245, 246, 252);
  doc.rect(0, 0, PAGE_W, 110, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(ctx.clinicName.toUpperCase(), MARGIN, 44, { charSpace: 1.2 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20);
  const titleLines = doc.splitTextToSize(title || "Relatório clínico", CONTENT_W) as string[];
  doc.text(titleLines[0], MARGIN, 68);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  const typeLabel = ASSESSMENT_TYPE_LABEL[json.assessment.type] ?? json.assessment.type ?? "Avaliação";
  doc.text(
    `${typeLabel} · ${formatDate(json.assessment.date)}`,
    MARGIN,
    88,
  );
  if (json.clinic.professional) {
    const line = [json.clinic.professional, json.clinic.professional_license]
      .filter(Boolean)
      .join(" · ");
    doc.text(line, PAGE_W - MARGIN, 88, { align: "right" });
  }
  doc.setTextColor(0);
  ctx.y = 140;
}

function drawDisclaimer(ctx: Ctx) {
  ensureSpace(ctx, 120);
  const { doc } = ctx;
  const boxX = MARGIN;
  const boxW = CONTENT_W;
  const paddingX = 14;
  const paddingY = 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 200);
  const headerText = "12 · DISCLAIMER CLÍNICO";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(60);
  const lines = doc.splitTextToSize(REPORT_DISCLAIMER, boxW - paddingX * 2) as string[];
  const lh = 10.5 * 1.4;
  const boxH = paddingY * 2 + 18 + lines.length * lh;
  ensureSpace(ctx, boxH);
  doc.setFillColor(245, 246, 252);
  doc.setDrawColor(220, 224, 240);
  doc.roundedRect(boxX, ctx.y, boxW, boxH, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 200);
  doc.text(headerText, boxX + paddingX, ctx.y + paddingY + 6, { charSpace: 1 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(60);
  let yy = ctx.y + paddingY + 22;
  for (const line of lines) {
    doc.text(line, boxX + paddingX, yy);
    yy += lh;
  }
  doc.setTextColor(0);
  ctx.y += boxH + 8;
}

function buildPdf(json: ReportJson, title: string): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ctx: Ctx = {
    doc,
    y: MARGIN,
    clinicName: json.clinic.name || "Clínica",
    generatedAt: new Date().toLocaleString("pt-BR"),
  };

  drawHeader(ctx, json, title);

  // 02 · Dados do paciente
  heading(ctx, "02", "Dados do paciente");
  keyValueGrid(ctx, [
    { label: "Nome", value: json.patient.full_name },
    { label: "Idade", value: json.patient.age ? `${json.patient.age} anos` : "" },
    { label: "Sexo", value: json.patient.sex },
    { label: "Ocupação", value: json.patient.occupation ?? "" },
    { label: "Objetivo principal", value: json.patient.main_goal },
  ]);

  // 03 · Dados da avaliação
  heading(ctx, "03", "Dados da avaliação");
  keyValueGrid(ctx, [
    { label: "Data", value: formatDate(json.assessment.date) },
    { label: "Profissional", value: json.clinic.professional || "—" },
    {
      label: "Tipo",
      value: ASSESSMENT_TYPE_LABEL[json.assessment.type] ?? json.assessment.type ?? "—",
    },
  ]);

  // 04 · Objetivo
  if (json.objective.trim()) {
    heading(ctx, "04", "Objetivo da avaliação");
    paragraph(ctx, json.objective);
  }

  // 05 · Resumo clínico
  if (json.clinical_summary.trim()) {
    heading(ctx, "05", "Resumo clínico");
    paragraph(ctx, json.clinical_summary);
  }

  // 06 · Achados posturais
  if (json.postural_findings.length > 0) {
    heading(ctx, "06", "Achados posturais observáveis");
    for (const f of json.postural_findings) {
      bullet(
        ctx,
        `${f.body_region || "Região"} — ${f.description || "sem descrição"} (${SEVERITY_LABEL[f.severity] ?? f.severity}).`,
      );
    }
    footnote(ctx, "Achados observados em imagem estática; sujeitos a confirmação clínica presencial.");
  }

  // 07 · Achados dinâmicos
  if (json.dynamic_findings.length > 0) {
    heading(ctx, "07", "Achados dinâmicos");
    for (const f of json.dynamic_findings) {
      const comps = f.compensations.length ? ` · compensações: ${f.compensations.join(", ")}` : "";
      bullet(
        ctx,
        `${f.movement} — qualidade ${f.quality_score}/100${comps}${f.notes ? ` — ${f.notes}` : ""}.`,
      );
    }
    footnote(ctx, "Análise dependente de confirmação profissional.");
  }

  // 08 · Exercícios avaliados
  if (json.exercise_findings.length > 0) {
    heading(ctx, "08", "Exercícios avaliados");
    for (const e of json.exercise_findings) {
      bullet(
        ctx,
        `${e.exercise} — ${SUPPORT_LEVEL_LABEL[e.support_level]}.`,
      );
      for (const o of e.observations) bullet(ctx, `   ${o}`);
      for (const c of e.suggested_cues ?? []) bullet(ctx, `   Cue: ${c}`);
    }
  }

  // 09 · Recomendações
  if (json.recommendations.length > 0) {
    heading(ctx, "09", "Recomendações");
    for (const r of json.recommendations) bullet(ctx, r);
  }

  // 10 · Plano inicial
  if (json.initial_plan.length > 0) {
    heading(ctx, "10", "Plano inicial sugerido");
    for (const p of json.initial_plan) {
      const dose = p.sets && p.reps ? `${p.sets}×${p.reps}` : "—";
      bullet(ctx, `${p.exercise} — ${dose}${p.notes ? ` · ${p.notes}` : ""}`);
    }
    footnote(ctx, "Plano inicial sugerido, a ajustar conforme resposta, dor e evolução.");
  }

  // 11 · Observações do profissional
  if (json.professional_notes.trim()) {
    heading(ctx, "11", "Observações do profissional");
    paragraph(ctx, json.professional_notes);
  }

  // 12 · Disclaimer (sempre)
  drawDisclaimer(ctx);

  stampAllFooters(ctx);

  const ab = doc.output("arraybuffer");
  return new Uint8Array(ab);
}

/**
 * Gera e faz upload do PDF do relatório no bucket clinical-media,
 * salvando a referência em `reports.pdf_storage_path`.
 * Retorna o storage path.
 */
export async function exportReportPdf(params: {
  reportId: string;
  clinicId: string;
  version: number;
  title: string;
  json: ReportJson;
}): Promise<string> {
  const bytes = buildPdf(params.json, params.title);
  const path = `${params.clinicId}/reports/${params.reportId}-v${params.version}.pdf`;
  const blob = new Blob([bytes], { type: "application/pdf" });
  const up = await supabase.storage
    .from("clinical-media")
    .upload(path, blob, { contentType: "application/pdf", upsert: true });
  if (up.error) throw new Error(up.error.message);

  const upd = await supabase
    .from("reports")
    .update({ pdf_storage_path: path } as never)
    .eq("id", params.reportId);
  if (upd.error) throw new Error(upd.error.message);

  return path;
}

/** Cria uma URL assinada de curta duração para download/visualização. */
export async function getReportPdfSignedUrl(path: string, expiresInSeconds = 300): Promise<string> {
  const { data, error } = await supabase.storage
    .from("clinical-media")
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}