import { prisma } from "./prisma";
import { RESERVATION_ACTIVE_STATUSES } from "./enums";

/** Função pura: verifica se dois intervalos [aStart,aEnd) e [bStart,bEnd) se sobrepõem. */
export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export interface ConflictingReservation {
  id: string;
  code: string;
  scheduledPickupAt: Date;
  scheduledReturnAt: Date;
}

/**
 * Verifica se existe alguma solicitação "ativa" (que ocupa a agenda) para o
 * mesmo equipamento cujo intervalo se sobrepõe ao intervalo informado.
 * Usada tanto na criação quanto na aprovação de uma solicitação.
 */
export async function findConflictingReservation(params: {
  equipmentId: string;
  scheduledPickupAt: Date;
  scheduledReturnAt: Date;
  excludeReservationId?: string;
}): Promise<ConflictingReservation | null> {
  const candidates = await prisma.reservation.findMany({
    where: {
      equipmentId: params.equipmentId,
      status: { in: RESERVATION_ACTIVE_STATUSES },
      ...(params.excludeReservationId ? { id: { not: params.excludeReservationId } } : {}),
    },
    select: { id: true, code: true, scheduledPickupAt: true, scheduledReturnAt: true },
  });

  return (
    candidates.find((c) =>
      intervalsOverlap(
        params.scheduledPickupAt,
        params.scheduledReturnAt,
        c.scheduledPickupAt,
        c.scheduledReturnAt
      )
    ) ?? null
  );
}
