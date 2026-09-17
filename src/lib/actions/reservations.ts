"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { can } from "@/lib/permissions";
import { findConflictingReservation } from "@/lib/reservationConflict";
import { generateSequentialCode, formatDateTime } from "@/lib/utils";
import { isValidPeriod } from "@/lib/validators";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const reservationSchema = z
  .object({
    equipmentId: z.string().min(1, "Selecione o equipamento."),
    projectId: z.string().optional(),
    purpose: z.string().min(3, "Descreva a finalidade da retirada."),
    location: z.string().optional(),
    scheduledPickupAt: z.string().min(1, "Informe a data/horário previstos de retirada."),
    scheduledReturnAt: z.string().min(1, "Informe a data/horário previstos de devolução."),
    notes: z.string().optional(),
  })
  .refine((d) => isValidPeriod(new Date(d.scheduledPickupAt), new Date(d.scheduledReturnAt)), {
    message: "A data/horário de devolução deve ser posterior à data/horário de retirada.",
    path: ["scheduledReturnAt"],
  });

export async function createReservation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("reservations.create");
    const raw = Object.fromEntries(formData);
    const data = reservationSchema.parse(raw);
    const batteryIds = formData.getAll("batteryIds").map(String).filter(Boolean);

    const pickupAt = new Date(data.scheduledPickupAt);
    const returnAt = new Date(data.scheduledReturnAt);

    const conflict = await findConflictingReservation({
      equipmentId: data.equipmentId,
      scheduledPickupAt: pickupAt,
      scheduledReturnAt: returnAt,
    });
    if (conflict) {
      return {
        error: `Conflito de agenda: já existe a solicitação ${conflict.code} para este equipamento entre ${formatDateTime(
          conflict.scheduledPickupAt
        )} e ${formatDateTime(conflict.scheduledReturnAt)}.`,
      };
    }

    const code = await generateSequentialCode("SOL", () => prisma.reservation.count());

    const reservation = await prisma.reservation.create({
      data: {
        code,
        requesterId: user.id,
        projectId: data.projectId || null,
        purpose: data.purpose,
        location: data.location || null,
        equipmentId: data.equipmentId,
        scheduledPickupAt: pickupAt,
        scheduledReturnAt: returnAt,
        notes: data.notes || null,
        status: "SOLICITADA",
        batteries: { create: batteryIds.map((batteryId) => ({ batteryId })) },
      },
    });

    await logAudit({
      userId: user.id,
      action: "CREATE",
      entityType: "Reservation",
      entityId: reservation.id,
      summary: `${user.name} criou a solicitação ${reservation.code}`,
      after: reservation,
    });

    revalidatePath("/solicitacoes");
    revalidatePath("/agenda");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/solicitacoes");
}

export async function cancelReservation(reservationId: string): Promise<ActionState> {
  try {
    const user = await requireUser();
    const reservation = await prisma.reservation.findUniqueOrThrow({ where: { id: reservationId } });

    const isOwner = reservation.requesterId === user.id;
    if (!isOwner && !can(user.role, "reservations.review")) {
      return { error: "Você não tem permissão para cancelar esta solicitação." };
    }
    if (!["RASCUNHO", "SOLICITADA", "EM_ANALISE", "APROVADA"].includes(reservation.status)) {
      return { error: "Esta solicitação não pode mais ser cancelada neste estágio." };
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELADA" },
    });

    await logAudit({
      userId: user.id,
      action: "STATUS_CHANGE",
      entityType: "Reservation",
      entityId: reservationId,
      summary: `${user.name} cancelou a solicitação ${reservation.code}`,
      before: reservation,
      after: updated,
    });

    revalidatePath("/solicitacoes");
    revalidatePath(`/solicitacoes/${reservationId}`);
    revalidatePath("/agenda");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

const reviewSchema = z.object({
  decision: z.enum(["APROVADA", "REJEITADA", "EM_ANALISE"]),
  reviewNotes: z.string().optional(),
});

export async function reviewReservation(
  reservationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requirePermission("reservations.review");
    const data = reviewSchema.parse(Object.fromEntries(formData));
    const reservation = await prisma.reservation.findUniqueOrThrow({ where: { id: reservationId } });

    if (!["SOLICITADA", "EM_ANALISE"].includes(reservation.status)) {
      return { error: "Esta solicitação já foi analisada." };
    }

    if (data.decision === "APROVADA") {
      const conflict = await findConflictingReservation({
        equipmentId: reservation.equipmentId,
        scheduledPickupAt: reservation.scheduledPickupAt,
        scheduledReturnAt: reservation.scheduledReturnAt,
        excludeReservationId: reservation.id,
      });
      if (conflict) {
        return {
          error: `Não é possível aprovar: conflito de agenda com a solicitação ${conflict.code}.`,
        };
      }
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: data.decision,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNotes: data.reviewNotes || null,
      },
    });

    await logAudit({
      userId: user.id,
      action: data.decision === "APROVADA" ? "APPROVE" : data.decision === "REJEITADA" ? "REJECT" : "STATUS_CHANGE",
      entityType: "Reservation",
      entityId: reservationId,
      summary: `${user.name} marcou a solicitação ${reservation.code} como ${data.decision}`,
      before: reservation,
      after: updated,
    });

    revalidatePath("/solicitacoes");
    revalidatePath(`/solicitacoes/${reservationId}`);
    revalidatePath("/agenda");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
