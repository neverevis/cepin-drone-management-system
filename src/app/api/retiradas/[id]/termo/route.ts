import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { generateTermoRetiradaPdf } from "@/lib/pdf/termoRetirada";
import { pdfDocToBuffer, pdfResponse } from "@/lib/pdf/stream";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Não autenticado.", { status: 401 });

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: params.id },
    include: {
      responsibleUser: true,
      deliveredBy: true,
      equipment: true,
      items: { include: { equipment: true, accessory: true, battery: true } },
    },
  });

  if (!withdrawal) return new Response("Retirada não encontrada.", { status: 404 });

  const settings = await getSettings();

  const doc = generateTermoRetiradaPdf(
    {
      code: withdrawal.code,
      suapProcessNumber: withdrawal.suapProcessNumber,
      suapDocumentNumber: withdrawal.suapDocumentNumber,
      purpose: withdrawal.purpose,
      location: withdrawal.location,
      scheduledPickupAt: withdrawal.scheduledPickupAt,
      scheduledReturnAt: withdrawal.scheduledReturnAt,
      checkoutAt: withdrawal.checkoutAt,
      equipment: withdrawal.equipment,
      responsibleUser: withdrawal.responsibleUser,
      responsibleRegistration: withdrawal.responsibleRegistration,
      responsiblePosition: withdrawal.responsiblePosition,
      responsibleSector: withdrawal.responsibleSector,
      deliveredBy: withdrawal.deliveredBy,
      items: withdrawal.items.map((item) => ({
        label: item.equipment?.name ?? item.accessory?.name ?? item.battery?.code ?? "Item",
        kind: item.equipmentId ? "equipamento" : item.batteryId ? "bateria" : "acessorio",
        present: item.present,
        chargePercentOut: item.chargePercentOut,
      })),
    },
    settings
  );

  const buffer = await pdfDocToBuffer(doc);

  await prisma.document.create({
    data: {
      kind: "TERMO_RETIRADA_PDF",
      title: `Termo de Retirada ${withdrawal.code}`,
      withdrawalId: withdrawal.id,
      generatedById: user.id,
    },
  });

  await logAudit({
    userId: user.id,
    action: "GENERATE_PDF",
    entityType: "Withdrawal",
    entityId: withdrawal.id,
    summary: `${user.name} gerou o Termo de Retirada em PDF (${withdrawal.code})`,
  });

  return pdfResponse(buffer, `termo-retirada-${withdrawal.code}.pdf`);
}
