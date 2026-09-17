import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { generateComprovanteDevolucaoPdf } from "@/lib/pdf/comprovanteDevolucao";
import { pdfDocToBuffer, pdfResponse } from "@/lib/pdf/stream";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Não autenticado.", { status: 401 });

  const ret = await prisma.return.findUnique({
    where: { id: params.id },
    include: {
      withdrawal: { include: { equipment: true } },
      responsibleUser: true,
      checkedBy: true,
      items: { include: { equipment: true, accessory: true, battery: true } },
    },
  });

  if (!ret) return new Response("Devolução não encontrada.", { status: 404 });

  const settings = await getSettings();

  const doc = generateComprovanteDevolucaoPdf(
    {
      withdrawalCode: ret.withdrawal.code,
      equipmentName: ret.withdrawal.equipment.name,
      returnedAt: ret.returnedAt,
      responsibleUser: ret.responsibleUser,
      checkedBy: ret.checkedBy,
      physicalCondition: ret.physicalCondition,
      hasDamage: ret.hasDamage,
      damageDescription: ret.damageDescription,
      pendencies: ret.pendencies,
      notes: ret.notes,
      closedAt: ret.closedAt,
      items: ret.items.map((item) => ({
        label: item.equipment?.name ?? item.accessory?.name ?? item.battery?.code ?? "Item",
        present: item.present,
        chargePercentIn: item.chargePercentIn,
      })),
    },
    settings
  );

  const buffer = await pdfDocToBuffer(doc);

  await prisma.document.create({
    data: {
      kind: "COMPROVANTE_DEVOLUCAO_PDF",
      title: `Comprovante de Devolução ${ret.withdrawal.code}`,
      returnId: ret.id,
      generatedById: user.id,
    },
  });

  await logAudit({
    userId: user.id,
    action: "GENERATE_PDF",
    entityType: "Return",
    entityId: ret.id,
    summary: `${user.name} gerou o comprovante de devolução em PDF (${ret.withdrawal.code})`,
  });

  return pdfResponse(buffer, `comprovante-devolucao-${ret.withdrawal.code}.pdf`);
}
