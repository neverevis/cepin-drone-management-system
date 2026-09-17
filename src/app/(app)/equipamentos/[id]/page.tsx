import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { AccessoryForm } from "@/components/equipment/AccessoryForm";
import { AccessoryStatusSelect } from "@/components/equipment/AccessoryStatusSelect";
import {
  ACCESSORY_STATUS_LABELS,
  ACCESSORY_TYPE_LABELS,
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  INCIDENT_STATUS_COLORS,
  INCIDENT_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      accessories: { orderBy: { type: "asc" } },
      reservations: { orderBy: { scheduledPickupAt: "desc" }, take: 10, include: { requester: true } },
      incidents: { orderBy: { createdAt: "desc" }, take: 5 },
      maintenanceRecords: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!equipment) notFound();

  const canManage = user && can(user.role, "equipment.manage");

  return (
    <div>
      <PageHeader
        title={equipment.name}
        description={[equipment.manufacturer, equipment.model].filter(Boolean).join(" · ") || undefined}
        actions={
          canManage ? (
            <Link href={`/equipamentos/${equipment.id}/editar`} className="btn-secondary">
              Editar
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Dados patrimoniais</h2>
            <Badge label={EQUIPMENT_STATUS_LABELS[equipment.status] ?? equipment.status} colorClass={EQUIPMENT_STATUS_COLORS[equipment.status]} />
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Nº de patrimônio" value={equipment.patrimonyNumber} />
            <Row label="Nº de série" value={equipment.serialNumber} />
            <Row label="Unidade de lotação" value={equipment.unit} />
            <Row label="Setor responsável" value={equipment.sector} />
            <Row label="Data de aquisição" value={equipment.acquisitionDate ? formatDate(equipment.acquisitionDate) : null} />
          </dl>
          {equipment.notes && (
            <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 p-3 text-xs text-gray-600">{equipment.notes}</p>
          )}
        </div>

        <div className="card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Acessórios ({equipment.accessories.length})</h2>
          </div>
          {equipment.accessories.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum acessório cadastrado para este equipamento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nome</th>
                    <th>Identificador</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.accessories.map((acc) => (
                    <tr key={acc.id}>
                      <td>{ACCESSORY_TYPE_LABELS[acc.type] ?? acc.type}</td>
                      <td>{acc.name}</td>
                      <td>{acc.identifier ?? acc.serialNumber ?? "-"}</td>
                      <td>
                        {canManage ? (
                          <AccessoryStatusSelect accessoryId={acc.id} status={acc.status} />
                        ) : (
                          ACCESSORY_STATUS_LABELS[acc.status] ?? acc.status
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {canManage && (
            <div className="mt-4">
              <AccessoryForm equipmentId={equipment.id} />
            </div>
          )}
        </div>

        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Histórico de retiradas recentes</h2>
          {equipment.reservations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma solicitação registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {equipment.reservations.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <Link href={`/solicitacoes/${r.id}`} className="text-gray-700 hover:text-cepin-700">
                    {r.code} · {r.requester.name} · {formatDateTime(r.scheduledPickupAt)}
                  </Link>
                  <Badge label={RESERVATION_STATUS_LABELS[r.status] ?? r.status} colorClass={RESERVATION_STATUS_COLORS[r.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Ocorrências recentes</h2>
          {equipment.incidents.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma ocorrência registrada.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {equipment.incidents.map((inc) => (
                <li key={inc.id} className="flex items-center justify-between">
                  <Link href={`/ocorrencias/${inc.id}`} className="text-gray-700 hover:text-cepin-700">
                    {inc.code}
                  </Link>
                  <Badge label={INCIDENT_STATUS_LABELS[inc.status] ?? inc.status} colorClass={INCIDENT_STATUS_COLORS[inc.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-800">{value || "-"}</dd>
    </div>
  );
}
