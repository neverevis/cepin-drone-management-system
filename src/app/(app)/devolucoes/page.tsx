import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default async function ReturnsListPage() {
  const returns = await prisma.return.findMany({
    orderBy: { returnedAt: "desc" },
    include: { withdrawal: { include: { equipment: true } }, responsibleUser: true, checkedBy: true },
  });

  return (
    <div>
      <PageHeader title="Devoluções" description="Registros de devolução do equipamento." />

      {returns.length === 0 ? (
        <EmptyState title="Nenhuma devolução registrada" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Retirada</th>
                <th>Devolvido em</th>
                <th>Responsável</th>
                <th>Conferente</th>
                <th>Avaria</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/devolucoes/${r.id}`} className="font-medium text-cepin-700 hover:underline">
                      {r.withdrawal.code}
                    </Link>
                  </td>
                  <td>{formatDateTime(r.returnedAt)}</td>
                  <td>{r.responsibleUser.name}</td>
                  <td>{r.checkedBy.name}</td>
                  <td>
                    {r.hasDamage ? (
                      <Badge label="Sim" colorClass="bg-red-100 text-red-800 border-red-300" />
                    ) : (
                      <Badge label="Não" colorClass="bg-green-100 text-green-800 border-green-300" />
                    )}
                  </td>
                  <td>
                    {r.closedAt ? (
                      <Badge label="Encerrada" colorClass="bg-emerald-100 text-emerald-800 border-emerald-300" />
                    ) : (
                      <Badge label="Com pendências" colorClass="bg-amber-100 text-amber-800 border-amber-300" />
                    )}
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
