import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { FLIGHT_ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMinutes } from "@/lib/utils";

export default async function FlightLogDetailPage({ params }: { params: { id: string } }) {
  const flightLog = await prisma.flightLog.findUnique({
    where: { id: params.id },
    include: {
      operator: true,
      project: true,
      withdrawal: { include: { equipment: true } },
      batteryUsageRecords: { include: { battery: true } },
    },
  });

  if (!flightLog) notFound();

  return (
    <div>
      <PageHeader title={`Atividade ${flightLog.activityNumber}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-4 text-sm">
          <Row label="Data" value={formatDate(flightLog.date)} />
          <Row label="Horário" value={`${flightLog.startTime} às ${flightLog.endTime}`} />
          <Row label="Duração" value={formatMinutes(flightLog.durationMinutes)} />
          <Row label="Tipo de atividade" value={FLIGHT_ACTIVITY_TYPE_LABELS[flightLog.activityType] ?? flightLog.activityType} />
          <Row label="Operador" value={flightLog.operator.name} />
          <Row label="Projeto" value={flightLog.project?.name} />
          <Row label="Finalidade" value={flightLog.purpose} />
          <Row label="Local" value={flightLog.location} />
          <p className="flex justify-between gap-2">
            <span className="text-gray-500">Retirada</span>
            <Link href={`/retiradas/${flightLog.withdrawal.id}`} className="text-cepin-700 hover:underline">
              {flightLog.withdrawal.code} — {flightLog.withdrawal.equipment.name}
            </Link>
          </p>
        </div>

        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Baterias utilizadas</h2>
          {flightLog.batteryUsageRecords.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma bateria informada para esta atividade.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {flightLog.batteryUsageRecords.map((u) => (
                <li key={u.id} className="flex justify-between border-b border-gray-50 pb-1">
                  <span>{u.battery.code}</span>
                  <span className="text-gray-600">
                    {u.chargeBefore}% → {u.chargeAfter ?? "?"}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(flightLog.occurrences || flightLog.notes) && (
          <div className="card space-y-2 p-4 text-sm lg:col-span-2">
            {flightLog.occurrences && (
              <div>
                <p className="font-medium text-gray-700">Ocorrências</p>
                <p className="text-gray-600">{flightLog.occurrences}</p>
              </div>
            )}
            {flightLog.notes && (
              <div>
                <p className="font-medium text-gray-700">Observações</p>
                <p className="text-gray-600">{flightLog.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
