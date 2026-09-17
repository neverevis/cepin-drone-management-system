import PDFDocument from "pdfkit";
import type { SystemSettings } from "@/lib/settings";
import { formatDate, formatDateTime } from "@/lib/utils";

export interface ComprovanteDevolucaoData {
  withdrawalCode: string;
  equipmentName: string;
  returnedAt: Date;
  responsibleUser: { name: string };
  checkedBy: { name: string };
  physicalCondition: string | null;
  hasDamage: boolean;
  damageDescription: string | null;
  pendencies: string | null;
  notes: string | null;
  closedAt: Date | null;
  items: { label: string; present: boolean; chargePercentIn: number | null }[];
}

export function generateComprovanteDevolucaoPdf(
  data: ComprovanteDevolucaoData,
  settings: SystemSettings
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  doc.fontSize(9).fillColor("#555").text(settings.institutionName, { align: "center" });
  doc.text(settings.campusName, { align: "center" });
  doc.text(`${settings.cepinName} - ${settings.cepinFullName}`, { align: "center" });
  doc.moveDown(1);

  doc
    .fontSize(13)
    .fillColor("#111")
    .font("Helvetica-Bold")
    .text("COMPROVANTE DE DEVOLUÇÃO DE DRONE E ACESSÓRIOS", { align: "center" });
  doc.fontSize(10).font("Helvetica").text(`Referente ao Termo de Retirada nº ${data.withdrawalCode}`, { align: "center" });
  doc.moveDown(1);

  section(doc, "Dados da devolução");
  field(doc, "Equipamento", data.equipmentName);
  field(doc, "Devolvido em", formatDateTime(data.returnedAt));
  field(doc, "Responsável pela devolução", data.responsibleUser.name);
  field(doc, "Conferente", data.checkedBy.name);
  field(doc, "Condição física geral", data.physicalCondition ?? "Não informada");
  doc.moveDown(0.5);

  section(doc, "Itens conferidos");
  data.items.forEach((item) => {
    const charge = item.chargePercentIn !== null ? ` — carga: ${item.chargePercentIn}%` : "";
    doc.fontSize(9).text(`• ${item.label}${item.present ? "" : " (NÃO devolvido)"}${charge}`);
  });
  doc.moveDown(0.5);

  section(doc, "Avarias e pendências");
  field(doc, "Avaria identificada", data.hasDamage ? "Sim" : "Não");
  if (data.hasDamage) field(doc, "Descrição", data.damageDescription ?? "-");
  field(doc, "Pendências", data.pendencies ?? "Nenhuma");
  if (data.notes) field(doc, "Observações", data.notes);
  field(doc, "Situação", data.closedAt ? `Encerrada em ${formatDateTime(data.closedAt)}` : "Aguardando encerramento administrativo");

  doc.moveDown(3);
  signature(doc, `${data.responsibleUser.name} — Responsável pela devolução`);
  doc.moveDown(2.5);
  signature(doc, `${data.checkedBy.name} — Conferente`);

  doc.moveDown(2);
  doc
    .fontSize(7)
    .fillColor("#888")
    .text(
      `Documento gerado eletronicamente pelo Sistema de Gestão do Drone do CEPIN em ${formatDate(new Date())}. ` +
        "Este comprovante não substitui eventual apuração administrativa de danos ou divergências.",
      { align: "center" }
    );

  doc.end();
  return doc;
}

function section(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#1c4e23").text(title);
  doc.fillColor("#111");
  doc.moveDown(0.2);
}

function field(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(9).font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(value);
}

function signature(doc: PDFKit.PDFDocument, caption: string) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.3);
  doc.fontSize(8).text(caption, { align: "center" });
}
