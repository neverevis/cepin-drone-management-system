"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSequentialCode } from "@/lib/utils";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "@/lib/enums";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

function parseTarget(target: string): { equipmentId?: string; accessoryId?: string; batteryId?: string } {
  const [kind, id] = target.split(":");
  if (kind === "equipment") return { equipmentId: id };
  if (kind === "accessory") return { accessoryId: id };
  if (kind === "battery") return { batteryId: id };
  return {};
}

const maintenanceSchema = z.object({
  target: z.string().min(1, "Selecione o item."),
  type: z.enum(MAINTENANCE_TYPES),
  status: z.enum(MAINTENANCE_STATUSES),
  scheduledDate: z.string().optional(),
  description: z.string().min(3, "Descreva a manutenção."),
  cost: z.string().optional(),
  externalProvider: z.string().optional(),
  responsibleId: z.string().optional(),
});

async function applyStatusToTarget(
  tx: Prisma.TransactionClient,
  target: { equipmentId?: string; accessoryId?: string; batteryId?: string },
  status: string
) {
  const equipmentStatus = status === "EM_ANDAMENTO" ? "EM_MANUTENCAO" : status === "CONCLUIDA" ? "DISPONIVEL" : undefined;
  if (!equipmentStatus) return;
  if (target.equipmentId) await tx.equipment.update({ where: { id: target.equipmentId }, data: { status: equipmentStatus } });
  if (target.batteryId) await tx.battery.update({ where: { id: target.batteryId }, data: { status: equipmentStatus } });
  if (target.accessoryId) await tx.accessory.update({ where: { id: target.accessoryId }, data: { status: equipmentStatus } });
}

export async function createMaintenance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("maintenance.manage");
    const data = maintenanceSchema.parse(Object.fromEntries(formData));
    const target = parseTarget(data.target);

    const code = await generateSequentialCode("MNT", () => prisma.maintenanceRecord.count());

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenanceRecord.create({
        data: {
          code,
          ...target,
          type: data.type,
          status: data.status,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
          completedDate: data.status === "CONCLUIDA" ? new Date() : null,
          description: data.description,
          cost: data.cost ? Number(data.cost) : null,
          externalProvider: data.externalProvider || null,
          responsibleId: data.responsibleId || null,
        },
      });
      await applyStatusToTarget(tx, target, data.status);
      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "MaintenanceRecord",
      entityId: record.id,
      summary: `${user.name} registrou a manutenção ${record.code} (${data.type})`,
      after: record,
    });

    revalidatePath("/ocorrencias");
    revalidatePath("/equipamentos");
    revalidatePath("/baterias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/ocorrencias?tab=manutencao");
}

const updateSchema = z.object({
  status: z.enum(MAINTENANCE_STATUSES),
  description: z.string().min(3, "Descreva a manutenção."),
  cost: z.string().optional(),
});

export async function updateMaintenance(
  maintenanceId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("maintenance.manage");
    const data = updateSchema.parse(Object.fromEntries(formData));
    const before = await prisma.maintenanceRecord.findUniqueOrThrow({ where: { id: maintenanceId } });

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceRecord.update({
        where: { id: maintenanceId },
        data: {
          status: data.status,
          description: data.description,
          cost: data.cost ? Number(data.cost) : null,
          completedDate: data.status === "CONCLUIDA" ? new Date() : before.completedDate,
        },
      });
      await applyStatusToTarget(
        tx,
        { equipmentId: before.equipmentId ?? undefined, accessoryId: before.accessoryId ?? undefined, batteryId: before.batteryId ?? undefined },
        data.status
      );
      return updated;
    });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "MaintenanceRecord",
      entityId: maintenanceId,
      summary: `${user.name} atualizou a manutenção ${before.code} para ${data.status}`,
      before,
      after: record,
    });

    revalidatePath("/ocorrencias");
    revalidatePath(`/ocorrencias/manutencoes/${maintenanceId}`);
    revalidatePath("/equipamentos");
    revalidatePath("/baterias");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
