"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSequentialCode } from "@/lib/utils";
import { PICKUP_CHECKLIST_ITEMS } from "@/lib/constants";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const withdrawalSchema = z.object({
  reservationId: z.string().min(1),
  suapProcessNumber: z.string().optional(),
  suapDocumentNumber: z.string().optional(),
  responsibleUserId: z.string().min(1, "Selecione o responsável pela retirada."),
  responsibleRegistration: z.string().optional(),
  responsiblePosition: z.string().optional(),
  responsibleSector: z.string().optional(),
  pickupNotes: z.string().optional(),
});

export async function registerWithdrawal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("withdrawals.register");
    const data = withdrawalSchema.parse(Object.fromEntries(formData));

    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: {
        equipment: { include: { accessories: true } },
        batteries: { include: { battery: true } },
        withdrawal: true,
      },
    });

    if (!reservation) return { error: "Solicitação não encontrada." };
    if (reservation.status !== "APROVADA") return { error: "Somente solicitações aprovadas podem gerar uma retirada." };
    if (reservation.withdrawal) return { error: "Esta solicitação já possui uma retirada registrada." };

    const checklist: Record<string, boolean> = {};
    for (const item of PICKUP_CHECKLIST_ITEMS) {
      checklist[item.key] = formData.get(`checklist_${item.key}`) === "on";
    }

    const batteryCharges: { batteryId: string; charge: number }[] = reservation.batteries.map((rb) => {
      const raw = formData.get(`battery_charge_${rb.batteryId}`);
      const charge = raw ? Math.max(0, Math.min(100, Number(raw))) : rb.battery.currentChargePercent;
      return { batteryId: rb.batteryId, charge };
    });

    const code = await generateSequentialCode("RET", () => prisma.withdrawal.count());

    const withdrawal = await prisma.$transaction(async (tx) => {
      const created = await tx.withdrawal.create({
        data: {
          code,
          reservationId: reservation.id,
          suapProcessNumber: data.suapProcessNumber || null,
          suapDocumentNumber: data.suapDocumentNumber || null,
          equipmentId: reservation.equipmentId,
          responsibleUserId: data.responsibleUserId,
          responsibleRegistration: data.responsibleRegistration || null,
          responsiblePosition: data.responsiblePosition || null,
          responsibleSector: data.responsibleSector || null,
          projectId: reservation.projectId,
          purpose: reservation.purpose,
          location: reservation.location,
          scheduledPickupAt: reservation.scheduledPickupAt,
          scheduledReturnAt: reservation.scheduledReturnAt,
          deliveredById: user.id,
          pickupChecklist: JSON.stringify(checklist),
          pickupNotes: data.pickupNotes || null,
          status: "ABERTA",
          items: {
            create: [
              {
                equipmentId: reservation.equipmentId,
                present: checklist.aeronave ?? true,
                conditionOut: "Conferido na retirada",
              },
              ...reservation.equipment.accessories.map((acc) => ({
                accessoryId: acc.id,
                present:
                  acc.type === "CONTROLE_REMOTO"
                    ? checklist.controle ?? true
                    : acc.type === "CARREGADOR"
                    ? checklist.carregador ?? true
                    : checklist.demaisAcessorios ?? true,
                conditionOut: "Conferido na retirada",
              })),
              ...batteryCharges.map((b) => ({
                batteryId: b.batteryId,
                present: true,
                conditionOut: "Conferido na retirada",
                chargePercentOut: b.charge,
              })),
            ],
          },
        },
      });

      await tx.reservation.update({ where: { id: reservation.id }, data: { status: "RETIRADA" } });
      await tx.equipment.update({ where: { id: reservation.equipmentId }, data: { status: "EM_USO" } });
      for (const acc of reservation.equipment.accessories) {
        await tx.accessory.update({ where: { id: acc.id }, data: { status: "EM_USO" } });
      }
      for (const b of batteryCharges) {
        await tx.battery.update({
          where: { id: b.batteryId },
          data: { status: "EM_USO", currentChargePercent: b.charge, lastChargeUpdateAt: new Date() },
        });
      }

      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Withdrawal",
      entityId: withdrawal.id,
      summary: `${user.name} registrou a retirada física ${withdrawal.code} referente à solicitação ${reservation.code}`,
      after: withdrawal,
    });

    revalidatePath("/retiradas");
    revalidatePath(`/solicitacoes/${reservation.id}`);
    revalidatePath("/equipamentos");
    revalidatePath("/baterias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/retiradas");
}
