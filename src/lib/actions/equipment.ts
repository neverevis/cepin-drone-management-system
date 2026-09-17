"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { EQUIPMENT_STATUSES, ACCESSORY_TYPES, ACCESSORY_STATUSES } from "@/lib/enums";
import type { ActionState } from "@/components/ActionForm";

const equipmentSchema = z.object({
  name: z.string().min(2, "Informe o nome do equipamento."),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  patrimonyNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  unit: z.string().optional(),
  sector: z.string().optional(),
  acquisitionDate: z.string().optional(),
  status: z.enum(EQUIPMENT_STATUSES),
  notes: z.string().optional(),
});

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

export async function createEquipment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const data = equipmentSchema.parse(Object.fromEntries(formData));

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        patrimonyNumber: data.patrimonyNumber || null,
        serialNumber: data.serialNumber || null,
        unit: data.unit || null,
        sector: data.sector || null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
        status: data.status,
        notes: data.notes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Equipment",
      entityId: equipment.id,
      summary: `${user.name} cadastrou o equipamento "${equipment.name}"`,
      after: equipment,
    });

    revalidatePath("/equipamentos");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/equipamentos");
}

export async function updateEquipment(
  equipmentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const data = equipmentSchema.parse(Object.fromEntries(formData));
    const before = await prisma.equipment.findUniqueOrThrow({ where: { id: equipmentId } });

    const equipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: data.name,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        patrimonyNumber: data.patrimonyNumber || null,
        serialNumber: data.serialNumber || null,
        unit: data.unit || null,
        sector: data.sector || null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
        status: data.status,
        notes: data.notes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "Equipment",
      entityId: equipment.id,
      summary: `${user.name} atualizou o equipamento "${equipment.name}"`,
      before,
      after: equipment,
    });

    revalidatePath("/equipamentos");
    revalidatePath(`/equipamentos/${equipmentId}`);
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect(`/equipamentos/${equipmentId}`);
}

const accessorySchema = z.object({
  type: z.enum(ACCESSORY_TYPES),
  name: z.string().min(2, "Informe o nome do acessório."),
  identifier: z.string().optional(),
  serialNumber: z.string().optional(),
  condition: z.string().optional(),
  status: z.enum(ACCESSORY_STATUSES),
  notes: z.string().optional(),
});

export async function createAccessory(
  equipmentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const data = accessorySchema.parse(Object.fromEntries(formData));

    const accessory = await prisma.accessory.create({
      data: {
        equipmentId,
        type: data.type,
        name: data.name,
        identifier: data.identifier || null,
        serialNumber: data.serialNumber || null,
        condition: data.condition || null,
        status: data.status,
        notes: data.notes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Accessory",
      entityId: accessory.id,
      summary: `${user.name} cadastrou o acessório "${accessory.name}"`,
      after: accessory,
    });

    revalidatePath(`/equipamentos/${equipmentId}`);
    return { success: "Acessório cadastrado com sucesso." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

export async function updateAccessoryStatus(
  accessoryId: string,
  status: string
): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const before = await prisma.accessory.findUniqueOrThrow({ where: { id: accessoryId } });
    const accessory = await prisma.accessory.update({
      where: { id: accessoryId },
      data: { status },
    });

    await logAudit({
      userId: user.id,
      action: "STATUS_CHANGE",
      entityType: "Accessory",
      entityId: accessory.id,
      summary: `${user.name} alterou o status do acessório "${accessory.name}" para ${status}`,
      before,
      after: accessory,
    });

    revalidatePath(`/equipamentos/${accessory.equipmentId}`);
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

export async function listAvailableEquipmentForReservation() {
  await requireUser();
  return prisma.equipment.findMany({
    where: { status: { notIn: ["BAIXADO", "INDISPONIVEL"] } },
    orderBy: { name: "asc" },
  });
}
