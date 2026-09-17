import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FLIGHT_ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMinutes } from "@/lib/utils";

export default async function FlightLogsListPage() {
  const flightLogs = await prisma.flightLog.findMany({
    orderBy: { date: "desc" },
    include: { operator: true, withdrawal: true, project: true },
    take: 200,
  });

  const totalMinutes = flightLogs.reduce((sum, f) => sum + f.durationMinutes, 0);

  return (
    <div>
      <PageHeader
        title="Utilizações"
        description={`Diário de voo — ${flightLogs.length} atividades registradas, totalizando ${formatMinutes(totalMinutes)}.`}
      />

      {flightLogs.length === 0 ? (
        <EmptyState title="Nenhuma utilização registrada" description="Registre voos a partir de uma retirada em aberto." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Data</th>
                <th>Duração</th>
                <th>Tipo</th>
                <th>Projeto</th>
                <th>Operador</th>
                <th>Retirada</th>
              </tr>
            </thead>
            <tbody>
              {flightLogs.map((f) => (
                <tr key={f.id}>
                  <td>
                    <Link href={`/utilizacoes/${f.id}`} className="font-medium text-cepin-700 hover:underline">
                      {f.activityNumber}
                    </Link>
                  </td>
                  <td>{formatDate(f.date)}</td>
                  <td>{formatMinutes(f.durationMinutes)}</td>
                  <td>{FLIGHT_ACTIVITY_TYPE_LABELS[f.activityType] ?? f.activityType}</td>
                  <td>{f.project?.name ?? "-"}</td>
                  <td>{f.operator.name}</td>
                  <td>
                    <Link href={`/retiradas/${f.withdrawal.id}`} className="text-cepin-700 hover:underline">
                      {f.withdrawal.code}
                    </Link>
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
