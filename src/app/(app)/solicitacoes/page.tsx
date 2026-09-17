import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export default async function ReservationsListPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const canReviewAll = can(user.role, "reservations.review") || can(user.role, "withdrawals.register");

  const where: Prisma.ReservationWhereInput = canReviewAll ? {} : { requesterId: user.id };
  if (searchParams.status) where.status = searchParams.status;

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { scheduledPickupAt: "desc" },
    include: { requester: true, equipment: true },
    take: 100,
  });

  const statusFilters = ["SOLICITADA", "EM_ANALISE", "APROVADA", "RETIRADA", "EM_USO", "DEVOLVIDA", "REJEITADA", "CANCELADA", "ENCERRADA"];

  return (
    <div>
      <PageHeader
        title="Solicitações"
        description={canReviewAll ? "Todas as solicitações de retirada do CEPIN." : "Suas solicitações de retirada."}
        actions={
          can(user.role, "reservations.create") ? (
            <Link href="/solicitacoes/nova" className="btn-primary">
              Nova solicitação
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href="/solicitacoes" className={!searchParams.status ? "font-semibold text-cepin-700" : "text-gray-500 hover:text-cepin-700"}>
          Todas
        </Link>
        {statusFilters.map((s) => (
          <Link
            key={s}
            href={`/solicitacoes?status=${s}`}
            className={searchParams.status === s ? "font-semibold text-cepin-700" : "text-gray-500 hover:text-cepin-700"}
          >
            {RESERVATION_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="Nenhuma solicitação encontrada" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Solicitante</th>
                <th>Equipamento</th>
                <th>Retirada prevista</th>
                <th>Devolução prevista</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/solicitacoes/${r.id}`} className="font-medium text-cepin-700 hover:underline">
                      {r.code}
                    </Link>
                  </td>
                  <td>{r.requester.name}</td>
                  <td>{r.equipment.name}</td>
                  <td>{formatDateTime(r.scheduledPickupAt)}</td>
                  <td>{formatDateTime(r.scheduledReturnAt)}</td>
                  <td>
                    <Badge label={RESERVATION_STATUS_LABELS[r.status] ?? r.status} colorClass={RESERVATION_STATUS_COLORS[r.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
