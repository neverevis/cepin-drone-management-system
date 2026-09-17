"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSequentialCode } from "@/lib/utils";
import { FLIGHT_ACTIVITY_TYPES } from "@/lib/enums";
import { percentSchema, timeToMinutes } from "@/lib/validators";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const flightLogSchema = z
  .object({
    date: z.string().min(1, "Informe a data da atividade."),
    startTime: z.string().regex(timeRegex, "Informe um horário de início válido (HH:mm)."),
    endTime: z.string().regex(timeRegex, "Informe um horário de término válido (HH:mm)."),
    projectId: z.string().optional(),
    purpose: z.string().optional(),
    location: z.string().optional(),
    activityType: z.enum(FLIGHT_ACTIVITY_TYPES),
    notes: z.string().optional(),
    occurrences: z.string().optional(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "O horário de término não pode ser anterior (ou igual) ao horário de início.",
    path: ["endTime"],
  });

export async function createFlightLog(
  withdrawalId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("flightlogs.register");
    const data = flightLogSchema.parse(Object.fromEntries(formData));

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { reservation: true, items: { include: { battery: true } } },
    });
    if (!withdrawal) return { error: "Retirada não encontrada." };
    if (withdrawal.status !== "ABERTA") return { error: "Esta retirada já foi encerrada." };

    const durationMinutes = timeToMinutes(data.endTime) - timeToMinutes(data.startTime);
    const activityNumber = await generateSequentialCode("ATV", () => prisma.flightLog.count());

    const batteryEntries = withdrawal.items
      .filter((i) => i.batteryId)
      .map((i) => {
        const before = formData.get(`battery_before_${i.batteryId}`);
        const after = formData.get(`battery_after_${i.batteryId}`);
        if (!before) return null;
        const chargeBefore = percentSchema.parse(before);
        const chargeAfter = after ? percentSchema.parse(after) : null;
        return { batteryId: i.batteryId as string, chargeBefore, chargeAfter };
      })
      .filter((e): e is { batteryId: string; chargeBefore: number; chargeAfter: number | null } => e !== null);

    for (const entry of batteryEntries) {
      if (entry.chargeAfter !== null && entry.chargeAfter > entry.chargeBefore) {
        return { error: "A carga final de uma bateria não pode ser maior que a carga inicial no mesmo voo." };
      }
    }

    const flightLog = await prisma.$transaction(async (tx) => {
      const created = await tx.flightLog.create({
        data: {
          activityNumber,
          withdrawalId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          durationMinutes,
          operatorId: user.id,
          projectId: data.projectId || null,
          purpose: data.purpose || null,
          location: data.location || null,
          activityType: data.activityType,
          notes: data.notes || null,
          occurrences: data.occurrences || null,
        },
      });

      for (const entry of batteryEntries) {
        await tx.batteryUsageRecord.create({
          data: {
            batteryId: entry.batteryId,
            flightLogId: created.id,
            withdrawalId,
            chargeBefore: entry.chargeBefore,
            chargeAfter: entry.chargeAfter,
            recordedById: user.id,
          },
        });
        await tx.battery.update({
          where: { id: entry.batteryId },
          data: {
            currentChargePercent: entry.chargeAfter ?? entry.chargeBefore,
            lastChargeUpdateAt: new Date(),
          },
        });
      }

      if (withdrawal.reservation.status === "RETIRADA") {
        await tx.reservation.update({ where: { id: withdrawal.reservation.id }, data: { status: "EM_USO" } });
      }

      return created;
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "FlightLog",
      entityId: flightLog.id,
      summary: `${user.name} registrou a atividade ${flightLog.activityNumber} (${durationMinutes} min)`,
      after: flightLog,
    });

    revalidatePath(`/retiradas/${withdrawalId}`);
    revalidatePath("/utilizacoes");
    revalidatePath("/baterias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect(`/retiradas/${withdrawalId}`);
}
