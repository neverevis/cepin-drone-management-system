"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSequentialCode } from "@/lib/utils";
import { INCIDENT_TYPES, INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/enums";
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

const incidentSchema = z.object({
  target: z.string().min(1, "Selecione o item afetado."),
  type: z.enum(INCIDENT_TYPES),
  severity: z.enum(INCIDENT_SEVERITIES),
  description: z.string().min(5, "Descreva a ocorrência."),
});

export async function createIncident(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("incidents.create");
    const data = incidentSchema.parse(Object.fromEntries(formData));
    const target = parseTarget(data.target);

    const code = await generateSequentialCode("OCO", () => prisma.incident.count());

    const incident = await prisma.incident.create({
      data: {
        code,
        ...target,
        type: data.type,
        severity: data.severity,
        description: data.description,
        reportedById: user.id,
        status: "ABERTA",
      },
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Incident",
      entityId: incident.id,
      summary: `${user.name} registrou a ocorrência ${incident.code} (${data.type})`,
      after: incident,
    });

    revalidatePath("/ocorrencias");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/ocorrencias");
}

const manageSchema = z.object({
  status: z.enum(INCIDENT_STATUSES),
  providences: z.string().optional(),
  blocksEquipment: z.coerce.boolean().optional(),
});

export async function updateIncident(incidentId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("incidents.manage");
    const raw = Object.fromEntries(formData);
    const data = manageSchema.parse({ ...raw, blocksEquipment: raw.blocksEquipment === "on" });

    const before = await prisma.incident.findUniqueOrThrow({ where: { id: incidentId } });

    const incident = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: incidentId },
        data: {
          status: data.status,
          providences: data.providences || null,
          blocksEquipment: !!data.blocksEquipment,
          closedAt: data.status === "ENCERRADA" ? new Date() : null,
        },
      });

      if (before.equipmentId) {
        if (data.blocksEquipment) {
          await tx.equipment.update({ where: { id: before.equipmentId }, data: { status: "INDISPONIVEL" } });
        } else if (before.blocksEquipment && !data.blocksEquipment) {
          await tx.equipment.update({ where: { id: before.equipmentId }, data: { status: "DISPONIVEL" } });
        }
      }
      if (before.batteryId) {
        if (data.blocksEquipment) {
          await tx.battery.update({ where: { id: before.batteryId }, data: { status: "INDISPONIVEL" } });
        } else if (before.blocksEquipment && !data.blocksEquipment) {
          await tx.battery.update({ where: { id: before.batteryId }, data: { status: "DISPONIVEL" } });
        }
      }
      if (before.accessoryId) {
        if (data.blocksEquipment) {
          await tx.accessory.update({ where: { id: before.accessoryId }, data: { status: "INDISPONIVEL" } });
        } else if (before.blocksEquipment && !data.blocksEquipment) {
          await tx.accessory.update({ where: { id: before.accessoryId }, data: { status: "DISPONIVEL" } });
        }
      }

      return updated;
    });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "Incident",
      entityId: incidentId,
      summary: `${user.name} atualizou a ocorrência ${before.code} para ${data.status}`,
      before,
      after: incident,
    });

    revalidatePath("/ocorrencias");
    revalidatePath(`/ocorrencias/${incidentId}`);
    revalidatePath("/equipamentos");
    revalidatePath("/baterias");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
