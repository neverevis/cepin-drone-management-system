"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { BATTERY_STATUSES } from "@/lib/enums";
import { percentSchema } from "@/lib/validators";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const batterySchema = z.object({
  code: z.string().min(1, "Informe um código para a bateria."),
  isPrimary: z.coerce.boolean().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  nominalCapacityMah: z.string().optional(),
  acquisitionDate: z.string().optional(),
  status: z.enum(BATTERY_STATUSES),
  currentChargePercent: percentSchema,
  cycleCount: z.string().optional(),
  notes: z.string().optional(),
});

export async function createBattery(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const raw = Object.fromEntries(formData);
    const data = batterySchema.parse({ ...raw, isPrimary: raw.isPrimary === "on" });

    const battery = await prisma.battery.create({
      data: {
        code: data.code,
        isPrimary: !!data.isPrimary,
        serialNumber: data.serialNumber || null,
        model: data.model || null,
        nominalCapacityMah: data.nominalCapacityMah ? Number(data.nominalCapacityMah) : null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
        status: data.status,
        currentChargePercent: data.currentChargePercent,
        cycleCount: data.cycleCount ? Number(data.cycleCount) : 0,
        notes: data.notes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Battery",
      entityId: battery.id,
      summary: `${user.name} cadastrou a bateria ${battery.code}`,
      after: battery,
    });

    revalidatePath("/baterias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/baterias");
}

export async function updateBattery(
  batteryId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const raw = Object.fromEntries(formData);
    const data = batterySchema.parse({ ...raw, isPrimary: raw.isPrimary === "on" });
    const before = await prisma.battery.findUniqueOrThrow({ where: { id: batteryId } });

    const battery = await prisma.battery.update({
      where: { id: batteryId },
      data: {
        code: data.code,
        isPrimary: !!data.isPrimary,
        serialNumber: data.serialNumber || null,
        model: data.model || null,
        nominalCapacityMah: data.nominalCapacityMah ? Number(data.nominalCapacityMah) : null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
        status: data.status,
        currentChargePercent: data.currentChargePercent,
        cycleCount: data.cycleCount ? Number(data.cycleCount) : 0,
        notes: data.notes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "Battery",
      entityId: battery.id,
      summary: `${user.name} atualizou o cadastro da bateria ${battery.code}`,
      before,
      after: battery,
    });

    revalidatePath("/baterias");
    revalidatePath(`/baterias/${batteryId}`);
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect(`/baterias/${batteryId}`);
}

const startChargeSchema = z.object({
  chargeBefore: percentSchema,
  notes: z.string().optional(),
});

export async function startBatteryCharge(
  batteryId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("battery.charge.register");
    const data = startChargeSchema.parse(Object.fromEntries(formData));

    const battery = await prisma.battery.findUniqueOrThrow({ where: { id: batteryId } });
    if (battery.status === "CARREGANDO") {
      return { error: "Esta bateria já está com um carregamento em andamento." };
    }

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.batteryChargeRecord.create({
        data: {
          batteryId,
          startedAt: new Date(),
          chargeBefore: data.chargeBefore,
          recordedById: user.id,
          notes: data.notes || null,
        },
      });
      await tx.battery.update({
        where: { id: batteryId },
        data: {
          status: "CARREGANDO",
          currentChargePercent: data.chargeBefore,
          lastChargeUpdateAt: new Date(),
        },
      });
      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "BatteryChargeRecord",
      entityId: record.id,
      summary: `${user.name} iniciou o carregamento da bateria ${battery.code} (${data.chargeBefore}%)`,
      after: record,
    });

    revalidatePath(`/baterias/${batteryId}`);
    revalidatePath("/baterias");
    return { success: "Carregamento iniciado." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

const finishChargeSchema = z.object({
  chargeAfter: percentSchema,
  notes: z.string().optional(),
});

export async function finishBatteryCharge(
  batteryId: string,
  recordId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("battery.charge.register");
    const data = finishChargeSchema.parse(Object.fromEntries(formData));

    const existing = await prisma.batteryChargeRecord.findUniqueOrThrow({ where: { id: recordId } });
    if (existing.finishedAt) {
      return { error: "Este registro de carregamento já foi concluído." };
    }

    const record = await prisma.$transaction(async (tx) => {
      const updated = await tx.batteryChargeRecord.update({
        where: { id: recordId },
        data: {
          finishedAt: new Date(),
          chargeAfter: data.chargeAfter,
          notes: data.notes ? `${existing.notes ?? ""}\n${data.notes}`.trim() : existing.notes,
        },
      });
      await tx.battery.update({
        where: { id: batteryId },
        data: {
          status: "DISPONIVEL",
          currentChargePercent: data.chargeAfter,
          lastChargeUpdateAt: new Date(),
        },
      });
      return updated;
    });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "BatteryChargeRecord",
      entityId: record.id,
      summary: `${user.name} concluiu o carregamento da bateria (${data.chargeAfter}%)`,
      before: existing,
      after: record,
    });

    revalidatePath(`/baterias/${batteryId}`);
    revalidatePath("/baterias");
    return { success: "Carregamento concluído." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

const usageSchema = z.object({
  chargeBefore: percentSchema,
  chargeAfter: percentSchema.optional(),
  cyclesReported: z.string().optional(),
  notes: z.string().optional(),
});

export async function registerBatteryUsage(
  batteryId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("battery.usage.register");
    const raw = Object.fromEntries(formData);
    const data = usageSchema.parse(raw);

    if (data.chargeAfter !== undefined && data.chargeAfter > data.chargeBefore) {
      return { error: "A carga final não pode ser maior que a carga inicial em uma atividade de uso." };
    }

    const battery = await prisma.battery.findUniqueOrThrow({ where: { id: batteryId } });
    const cyclesReported = data.cyclesReported ? Number(data.cyclesReported) : null;

    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.batteryUsageRecord.create({
        data: {
          batteryId,
          chargeBefore: data.chargeBefore,
          chargeAfter: data.chargeAfter ?? null,
          cyclesReported,
          recordedById: user.id,
          notes: data.notes || null,
        },
      });
      await tx.battery.update({
        where: { id: batteryId },
        data: {
          currentChargePercent: data.chargeAfter ?? data.chargeBefore,
          lastChargeUpdateAt: new Date(),
          ...(cyclesReported !== null ? { cycleCount: cyclesReported } : {}),
        },
      });
      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "BatteryUsageRecord",
      entityId: record.id,
      summary: `${user.name} registrou uso da bateria ${battery.code} (${data.chargeBefore}% → ${
        data.chargeAfter ?? "?"
      }%)`,
      after: record,
    });

    revalidatePath(`/baterias/${batteryId}`);
    revalidatePath("/baterias");
    return { success: "Uso da bateria registrado." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

export async function updateBatteryStatus(batteryId: string, status: string): Promise<ActionState> {
  try {
    const user = await requirePermission("equipment.manage");
    const before = await prisma.battery.findUniqueOrThrow({ where: { id: batteryId } });
    const battery = await prisma.battery.update({ where: { id: batteryId }, data: { status } });

    await logAudit({
      userId: user.id,
      action: "STATUS_CHANGE",
      entityType: "Battery",
      entityId: battery.id,
      summary: `${user.name} alterou o status da bateria ${battery.code} para ${status}`,
      before,
      after: battery,
    });

    revalidatePath(`/baterias/${batteryId}`);
    revalidatePath("/baterias");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
