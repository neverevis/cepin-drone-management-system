import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { PICKUP_CHECKLIST_ITEMS, WITHDRAWAL_STATUS_COLORS, WITHDRAWAL_STATUS_LABELS, FLIGHT_ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, formatMinutes } from "@/lib/utils";

export default async function WithdrawalDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: params.id },
    include: {
      responsibleUser: true,
      deliveredBy: true,
      equipment: true,
      project: true,
      items: { include: { equipment: true, accessory: true, battery: true } },
      flightLogs: { orderBy: { date: "desc" }, include: { operator: true } },
      return: true,
    },
  });

  if (!withdrawal || !user) notFound();

  const checklist = JSON.parse(withdrawal.pickupChecklist) as Record<string, boolean>;
  const canRegisterFlight = can(user.role, "flightlogs.register") && withdrawal.status === "ABERTA";
  const canReturn = can(user.role, "returns.register") && withdrawal.status === "ABERTA" && !withdrawal.return;

  return (
    <div>
      <PageHeader
        title={`Retirada ${withdrawal.code}`}
        actions={
          <>
            <a href={`/api/retiradas/${withdrawal.id}/termo`} target="_blank" rel="noreferrer" className="btn-secondary">
              Gerar Termo (PDF)
            </a>
            {canReturn && (
              <Link href={`/devolucoes/nova?withdrawalId=${withdrawal.id}`} className="btn-primary">
                Registrar devolução
              </Link>
            )}
          </>
        }
      />

      <div className="mb-4">
        <Badge label={WITHDRAWAL_STATUS_LABELS[withdrawal.status] ?? withdrawal.status} colorClass={WITHDRAWAL_STATUS_COLORS[withdrawal.status]} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-2">
          <Row label="Responsável" value={withdrawal.responsibleUser.name} />
          <Row label="Matrícula" value={withdrawal.responsibleRegistration} />
          <Row label="Cargo / função" value={withdrawal.responsiblePosition} />
          <Row label="Setor" value={withdrawal.responsibleSector} />
          <Row label="Equipamento" value={withdrawal.equipment.name} />
          <Row label="Finalidade" value={withdrawal.purpose} />
          <Row label="Local" value={withdrawal.location} />
          <Row label="Processo SUAP" value={withdrawal.suapProcessNumber} />
          <Row label="Documento SUAP" value={withdrawal.suapDocumentNumber} />
          <Row label="Entregue por" value={withdrawal.deliveredBy?.name} />
          <Row label="Retirado em" value={formatDateTime(withdrawal.checkoutAt)} />
          <Row label="Devolução prevista" value={formatDateTime(withdrawal.scheduledReturnAt)} />
        </div>

        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Checklist de entrega</h2>
          <ul className="space-y-1 text-sm">
            {PICKUP_CHECKLIST_ITEMS.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <span className={checklist[item.key] ? "text-green-600" : "text-gray-300"}>●</span>
                <span className={checklist[item.key] ? "text-gray-700" : "text-gray-400 line-through"}>{item.label}</span>
              </li>
            ))}
          </ul>
          {withdrawal.pickupNotes && <p className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-600">{withdrawal.pickupNotes}</p>}
        </div>

        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Itens conferidos na retirada</h2>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Presente</th>
                  <th>Carga na entrega</th>
                </tr>
              </thead>
              <tbody>
                {withdrawal.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.equipment?.name ?? item.accessory?.name ?? item.battery?.code}</td>
                    <td>{item.present ? "Sim" : "Não"}</td>
                    <td>{item.chargePercentOut !== null ? `${item.chargePercentOut}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 lg:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Diário de utilização ({withdrawal.flightLogs.length})</h2>
            {canRegisterFlight && (
              <Link href={`/utilizacoes/nova?withdrawalId=${withdrawal.id}`} className="btn-secondary">
                Registrar utilização
              </Link>
            )}
          </div>
          {withdrawal.flightLogs.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Atividade</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th>Tipo</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawal.flightLogs.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Link href={`/utilizacoes/${f.id}`} className="text-cepin-700 hover:underline">
                          {f.activityNumber}
                        </Link>
                      </td>
                      <td>{formatDateTime(f.date)}</td>
                      <td>{formatMinutes(f.durationMinutes)}</td>
                      <td>{FLIGHT_ACTIVITY_TYPE_LABELS[f.activityType] ?? f.activityType}</td>
                      <td>{f.operator.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {withdrawal.return && (
          <div className="card p-4 lg:col-span-3">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Devolução</h2>
            <Link href={`/devolucoes/${withdrawal.return.id}`} className="text-cepin-700 hover:underline">
              Ver registro de devolução
            </Link>
          </div>
        )}
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
