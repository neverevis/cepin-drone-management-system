import PDFDocument from "pdfkit";
import type { SystemSettings } from "@/lib/settings";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ACCESSORY_TYPE_LABELS } from "@/lib/constants";

export interface TermoRetiradaData {
  code: string;
  suapProcessNumber: string | null;
  suapDocumentNumber: string | null;
  purpose: string;
  location: string | null;
  scheduledPickupAt: Date;
  scheduledReturnAt: Date;
  checkoutAt: Date;
  equipment: {
    name: string;
    manufacturer: string | null;
    model: string | null;
    serialNumber: string | null;
    patrimonyNumber: string | null;
  };
  responsibleUser: { name: string; email: string };
  responsibleRegistration: string | null;
  responsiblePosition: string | null;
  responsibleSector: string | null;
  deliveredBy: { name: string } | null;
  items: {
    label: string;
    kind: "equipamento" | "bateria" | "acessorio";
    present: boolean;
    chargePercentOut: number | null;
  }[];
}

const CLAUSES = [
  [
    "1. DO OBJETO",
    "O presente Termo tem por finalidade formalizar a retirada, a responsabilidade, o registro de " +
      "utilização e a devolução de equipamento institucional destinado a atividades de ensino, pesquisa, " +
      "extensão, inovação e demais atividades autorizadas pelo Instituto Federal de Educação, Ciência e " +
      "Tecnologia de São Paulo.",
  ],
  [
    "2. DA GUARDA E CONSERVAÇÃO",
    "O(a) responsável indicado(a) neste Termo compromete-se a zelar pela guarda e conservação do " +
      "equipamento e de seus acessórios, mantendo-os em condições adequadas de uso durante todo o " +
      "período de retirada.",
  ],
  [
    "3. DO USO INSTITUCIONAL",
    "O equipamento deverá ser utilizado exclusivamente para as atividades institucionais autorizadas, " +
      "descritas na finalidade indicada neste Termo, sendo vedado seu uso para fins particulares ou " +
      "estranhos às atividades do CEPIN e do IFSP.",
  ],
  [
    "4. DAS ORIENTAÇÕES DO FABRICANTE",
    "O(a) responsável declara ciência das orientações técnicas e de segurança do fabricante para operação " +
      "da aeronave remotamente pilotada, incluindo procedimentos de verificação pré-voo, calibrações " +
      "necessárias e limites operacionais de segurança.",
  ],
  [
    "5. DO REGISTRO DE UTILIZAÇÃO",
    "O(a) responsável deverá registrar no sistema os horários efetivos de utilização, as atividades " +
      "realizadas e as informações de carga das baterias utilizadas, mantendo o diário de voo atualizado.",
  ],
  [
    "6. DA COMUNICAÇÃO DE OCORRÊNCIAS",
    "Qualquer avaria, perda, furto ou incidente envolvendo o equipamento ou seus acessórios deverá ser " +
      "comunicado(a) imediatamente ao CEPIN, mediante registro de ocorrência no sistema.",
  ],
  [
    "7. DAS ALTERAÇÕES NÃO AUTORIZADAS",
    "É vedada a realização de alterações, reparos ou intervenções técnicas não autorizadas no equipamento, " +
      "devendo qualquer manutenção ser conduzida exclusivamente por pessoal técnico autorizado pelo CEPIN.",
  ],
  [
    "8. DA DEVOLUÇÃO",
    "O equipamento e todos os seus acessórios deverão ser devolvidos no prazo estabelecido neste Termo, " +
      "em condições compatíveis com o uso normal, mediante conferência formal de devolução.",
  ],
  [
    "9. DAS NORMAS APLICÁVEIS",
    "O(a) responsável declara ciência e compromisso de observância das normas da Agência Nacional de " +
      "Aviação Civil (ANAC) e demais regulamentações aplicáveis à operação de aeronaves remotamente " +
      "pilotadas (drones) em território nacional.",
  ],
];

export function generateTermoRetiradaPdf(
  data: TermoRetiradaData,
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
    .text("TERMO DE RETIRADA, RESPONSABILIDADE E REGISTRO DE USO DE DRONE E ACESSÓRIOS", {
      align: "center",
    });
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").text(`Termo nº ${data.code}`, { align: "center" });
  if (data.suapProcessNumber) {
    doc.text(`Processo SUAP nº ${data.suapProcessNumber}`, { align: "center" });
  }
  doc.moveDown(1);

  drawSectionTitle(doc, "Identificação do equipamento");
  drawField(doc, "Equipamento", data.equipment.name);
  drawField(doc, "Fabricante / Modelo", [data.equipment.manufacturer, data.equipment.model].filter(Boolean).join(" / ") || "-");
  drawField(doc, "Nº de patrimônio", data.equipment.patrimonyNumber ?? "-");
  drawField(doc, "Nº de série", data.equipment.serialNumber ?? "-");
  doc.moveDown(0.5);

  drawSectionTitle(doc, "Baterias e acessórios retirados");
  const relevantItems = data.items.filter((i) => i.kind !== "equipamento");
  if (relevantItems.length === 0) {
    doc.fontSize(9).text("Nenhum acessório vinculado.");
  } else {
    relevantItems.forEach((item) => {
      const chargeInfo = item.chargePercentOut !== null ? ` — carga na entrega: ${item.chargePercentOut}%` : "";
      doc.fontSize(9).text(`• ${item.label}${item.present ? "" : " (não retirado)"}${chargeInfo}`);
    });
  }
  doc.moveDown(0.5);

  drawSectionTitle(doc, "Responsável pela retirada");
  drawField(doc, "Nome", data.responsibleUser.name);
  drawField(doc, "E-mail institucional", data.responsibleUser.email);
  drawField(doc, "Matrícula / SIAPE", data.responsibleRegistration ?? "-");
  drawField(doc, "Cargo / função", data.responsiblePosition ?? "-");
  drawField(doc, "Setor", data.responsibleSector ?? "-");
  doc.moveDown(0.5);

  drawSectionTitle(doc, "Finalidade e período");
  drawField(doc, "Finalidade", data.purpose);
  drawField(doc, "Local de utilização", data.location ?? "-");
  drawField(doc, "Data/horário previstos de retirada", formatDateTime(data.scheduledPickupAt));
  drawField(doc, "Data/horário previstos de devolução", formatDateTime(data.scheduledReturnAt));
  drawField(doc, "Retirada efetivada em", formatDateTime(data.checkoutAt));
  if (data.deliveredBy) drawField(doc, "Entregue por (conferente)", data.deliveredBy.name);

  doc.moveDown(1);
  drawSectionTitle(doc, "Cláusulas e responsabilidades");
  CLAUSES.forEach(([title, text]) => {
    doc.fontSize(9).font("Helvetica-Bold").text(title);
    doc.font("Helvetica").text(text, { align: "justify" });
    doc.moveDown(0.4);
  });

  doc.moveDown(0.5);
  doc
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text(
      "Declaro estar ciente dos termos acima e assumo integral responsabilidade pela guarda, conservação " +
        "e correta utilização do equipamento e acessórios descritos neste Termo, comprometendo-me a " +
        "devolvê-los nas condições e prazo aqui estabelecidos.",
      { align: "justify" }
    );

  doc.moveDown(3);
  drawSignatureLine(doc, `${data.responsibleUser.name} — Responsável pela retirada`);
  doc.moveDown(2.5);
  drawSignatureLine(doc, `${settings.coordinatorName || "_______________________"} — ${settings.coordinatorPosition}`);
  doc.moveDown(2.5);
  drawSignatureLine(doc, "Conferente da devolução (a ser assinado no ato da devolução)");

  doc.moveDown(2);
  doc
    .fontSize(7)
    .fillColor("#888")
    .text(
      `Documento gerado eletronicamente pelo Sistema de Gestão do Drone do CEPIN em ${formatDate(new Date())}. ` +
        "A geração deste PDF não substitui a assinatura das partes nem equivale à aprovação institucional formal.",
      { align: "center" }
    );

  doc.end();
  return doc;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#1c4e23").text(title);
  doc.fillColor("#111");
  doc.moveDown(0.2);
}

function drawField(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(9).font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(value);
}

function drawSignatureLine(doc: PDFKit.PDFDocument, caption: string) {
  const y = doc.y;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.3);
  doc.fontSize(8).font("Helvetica").text(caption, { align: "center" });
}
