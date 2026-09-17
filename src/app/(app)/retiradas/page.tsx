import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { WITHDRAWAL_STATUS_COLORS, WITHDRAWAL_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function WithdrawalsListPage() {
  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { checkoutAt: "desc" },
    include: { responsibleUser: true, equipment: true, return: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Retiradas" description="Retiradas físicas registradas do equipamento." />

      {withdrawals.length === 0 ? (
        <EmptyState
          title="Nenhuma retirada registrada"
          description="Aprove uma solicitação na Agenda para poder registrar a retirada física."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Termo</th>
                <th>Responsável</th>
                <th>Equipamento</th>
                <th>Retirado em</th>
                <th>Devolução prevista</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td>
                    <Link href={`/retiradas/${w.id}`} className="font-medium text-cepin-700 hover:underline">
                      {w.code}
                    </Link>
                  </td>
                  <td>{w.responsibleUser.name}</td>
                  <td>{w.equipment.name}</td>
                  <td>{formatDateTime(w.checkoutAt)}</td>
                  <td>{formatDateTime(w.scheduledReturnAt)}</td>
                  <td>
                    <Badge label={WITHDRAWAL_STATUS_LABELS[w.status] ?? w.status} colorClass={WITHDRAWAL_STATUS_COLORS[w.status]} />
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
