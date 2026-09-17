import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { ReservationReviewForm } from "@/components/reservations/ReservationReviewForm";
import { CancelReservationButton } from "@/components/reservations/CancelReservationButton";
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function ReservationDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      reviewedBy: true,
      equipment: true,
      project: true,
      batteries: { include: { battery: true } },
      withdrawal: true,
    },
  });

  if (!reservation || !user) notFound();

  const canReview = can(user.role, "reservations.review");
  const canCancel =
    reservation.requesterId === user.id || can(user.role, "reservations.review");
  const canRegisterWithdrawal = can(user.role, "withdrawals.register");

  return (
    <div>
      <PageHeader
        title={`Solicitação ${reservation.code}`}
        actions={<Badge label={RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status} colorClass={RESERVATION_STATUS_COLORS[reservation.status]} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-2">
          <Row label="Solicitante" value={reservation.requester.name} />
          <Row label="Equipamento" value={reservation.equipment.name} />
          <Row label="Projeto" value={reservation.project?.name} />
          <Row label="Finalidade" value={reservation.purpose} />
          <Row label="Local" value={reservation.location} />
          <Row label="Retirada prevista" value={formatDateTime(reservation.scheduledPickupAt)} />
          <Row label="Devolução prevista" value={formatDateTime(reservation.scheduledReturnAt)} />
          <Row
            label="Baterias previstas"
            value={reservation.batteries.map((b) => b.battery.code).join(", ") || "Nenhuma selecionada"}
          />
          {reservation.notes && <Row label="Observações" value={reservation.notes} />}
          {reservation.reviewedBy && (
            <Row
              label="Analisado por"
              value={`${reservation.reviewedBy.name} em ${formatDateTime(reservation.reviewedAt)}`}
            />
          )}
          {reservation.reviewNotes && <Row label="Parecer" value={reservation.reviewNotes} />}
        </div>

        <div className="space-y-4">
          {canReview && ["SOLICITADA", "EM_ANALISE"].includes(reservation.status) && (
            <ReservationReviewForm reservationId={reservation.id} />
          )}

          {reservation.status === "APROVADA" && !reservation.withdrawal && canRegisterWithdrawal && (
            <div className="card p-4">
              <p className="mb-2 text-sm text-gray-600">
                Solicitação aprovada. Registre a retirada física quando o equipamento for entregue.
              </p>
              <Link href={`/retiradas/nova?reservationId=${reservation.id}`} className="btn-primary w-full text-center">
                Registrar retirada física
              </Link>
            </div>
          )}

          {reservation.withdrawal && (
            <div className="card p-4">
              <p className="mb-2 text-sm text-gray-600">Retirada física registrada.</p>
              <Link href={`/retiradas/${reservation.withdrawal.id}`} className="btn-secondary w-full text-center">
                Ver retirada {reservation.withdrawal.code}
              </Link>
            </div>
          )}

          {canCancel && ["RASCUNHO", "SOLICITADA", "EM_ANALISE", "APROVADA"].includes(reservation.status) && (
            <div className="card p-4">
              <CancelReservationButton reservationId={reservation.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800 sm:text-right">{value || "-"}</dd>
    </div>
  );
}
