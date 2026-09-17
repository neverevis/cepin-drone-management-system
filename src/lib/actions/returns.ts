"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { RETURN_CHECKLIST_ITEMS } from "@/lib/constants";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const returnSchema = z.object({
  withdrawalId: z.string().min(1),
  responsibleUserId: z.string().min(1, "Selecione quem está devolvendo o equipamento."),
  checkedById: z.string().min(1, "Selecione o conferente."),
  physicalCondition: z.string().optional(),
  notes: z.string().optional(),
  pendencies: z.string().optional(),
  hasDamage: z.coerce.boolean().optional(),
  damageDescription: z.string().optional(),
});

export async function registerReturn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("returns.register");
    const raw = Object.fromEntries(formData);
    const data = returnSchema.parse({ ...raw, hasDamage: raw.hasDamage === "on" });

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: data.withdrawalId },
      include: {
        equipment: { include: { accessories: true } },
        items: { include: { battery: true, accessory: true, equipment: true } },
        return: true,
      },
    });

    if (!withdrawal) return { error: "Retirada não encontrada." };
    if (withdrawal.status !== "ABERTA") return { error: "Esta retirada já foi encerrada." };
    if (withdrawal.return) return { error: "Esta retirada já possui devolução registrada." };
    if (data.hasDamage && !data.damageDescription) {
      return { error: "Descreva a avaria identificada." };
    }

    const checklist: Record<string, boolean> = {};
    for (const item of RETURN_CHECKLIST_ITEMS) {
      checklist[item.key] = formData.get(`checklist_${item.key}`) === "on";
    }

    const batteryCharges = new Map<string, number>();
    for (const item of withdrawal.items) {
      if (!item.batteryId) continue;
      const raw = formData.get(`battery_charge_${item.batteryId}`);
      batteryCharges.set(item.batteryId, raw ? Math.max(0, Math.min(100, Number(raw))) : item.battery!.currentChargePercent);
    }

    const returned = await prisma.$transaction(async (tx) => {
      const created = await tx.return.create({
        data: {
          withdrawalId: withdrawal.id,
          responsibleUserId: data.responsibleUserId,
          checkedById: data.checkedById,
          physicalCondition: data.physicalCondition || null,
          notes: data.notes || null,
          pendencies: data.pendencies || null,
          hasDamage: !!data.hasDamage,
          damageDescription: data.damageDescription || null,
          items: {
            create: withdrawal.items.map((item) => {
              if (item.equipmentId) {
                return {
                  equipmentId: item.equipmentId,
                  present: checklist.aeronave ?? true,
                  conditionIn: "Conferido na devolução",
                };
              }
              if (item.accessoryId) {
                const acc = item.accessory!;
                const present =
                  acc.type === "CONTROLE_REMOTO"
                    ? checklist.controle ?? true
                    : acc.type === "CARREGADOR"
                    ? checklist.carregador ?? true
                    : acc.type === "MALETA"
                    ? checklist.maleta ?? true
                    : checklist.demaisAcessorios ?? true;
                return { accessoryId: item.accessoryId, present, conditionIn: "Conferido na devolução" };
              }
              const batteryId = item.batteryId!;
              return {
                batteryId,
                present: true,
                conditionIn: "Conferido na devolução",
                chargePercentIn: batteryCharges.get(batteryId) ?? null,
              };
            }),
          },
        },
      });

      const equipmentStatus = data.hasDamage ? "EM_MANUTENCAO" : "DISPONIVEL";
      await tx.equipment.update({ where: { id: withdrawal.equipmentId }, data: { status: equipmentStatus } });

      for (const acc of withdrawal.equipment.accessories) {
        await tx.accessory.update({ where: { id: acc.id }, data: { status: "DISPONIVEL" } });
      }

      for (const [batteryId, charge] of batteryCharges) {
        await tx.battery.update({
          where: { id: batteryId },
          data: { status: "DISPONIVEL", currentChargePercent: charge, lastChargeUpdateAt: new Date() },
        });
      }

      await tx.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "DEVOLVIDA" } });
      await tx.reservation.update({ where: { id: withdrawal.reservationId }, data: { status: "DEVOLVIDA" } });

      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Return",
      entityId: returned.id,
      summary: `${user.name} registrou a devolução da retirada ${withdrawal.code}`,
      after: returned,
    });

    revalidatePath("/devolucoes");
    revalidatePath(`/retiradas/${withdrawal.id}`);
    revalidatePath("/equipamentos");
    revalidatePath("/baterias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/devolucoes");
}

const closeSchema = z.object({
  closedNotes: z.string().optional(),
});

export async function closeReturn(returnId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("returns.close");
    const data = closeSchema.parse(Object.fromEntries(formData));

    const existing = await prisma.return.findUniqueOrThrow({ where: { id: returnId }, include: { withdrawal: true } });
    if (existing.closedAt) return { error: "Esta devolução já está encerrada." };
    if (existing.hasDamage && !data.closedNotes) {
      return { error: "Registre uma justificativa/providência antes de encerrar uma devolução com avaria." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.return.update({
        where: { id: returnId },
        data: { closedAt: new Date(), closedNotes: data.closedNotes || null },
      });
      await tx.reservation.update({ where: { id: existing.withdrawal.reservationId }, data: { status: "ENCERRADA" } });
      return r;
    });

    await logAudit({
      userId: user.id,
      action: "STATUS_CHANGE",
      entityType: "Return",
      entityId: returnId,
      summary: `${user.name} encerrou a devolução da retirada ${existing.withdrawal.code}`,
      before: existing,
      after: updated,
    });

    revalidatePath(`/devolucoes/${returnId}`);
    revalidatePath("/devolucoes");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
