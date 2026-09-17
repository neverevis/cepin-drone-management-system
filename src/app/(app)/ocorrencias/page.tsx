import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import {
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_COLORS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
  MAINTENANCE_STATUS_COLORS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";

export default async function IncidentsAndMaintenancePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await getCurrentUser();
  const tab = searchParams.tab === "manutencao" ? "manutencao" : "ocorrencias";

  const [incidents, maintenanceRecords] = await Promise.all([
    tab === "ocorrencias"
      ? prisma.incident.findMany({
          orderBy: { createdAt: "desc" },
          include: { equipment: true, accessory: true, battery: true, reportedBy: true },
          take: 100,
        })
      : Promise.resolve([]),
    tab === "manutencao"
      ? prisma.maintenanceRecord.findMany({
          orderBy: { createdAt: "desc" },
          include: { equipment: true, accessory: true, battery: true, responsible: true },
          take: 100,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Ocorrências e Manutenção"
        description="Avarias, falhas, perdas e manutenções preventivas/corretivas do equipamento."
        actions={
          tab === "ocorrencias" ? (
            user && can(user.role, "incidents.create") ? (
              <Link href="/ocorrencias/nova" className="btn-primary">
                Nova ocorrência
              </Link>
            ) : undefined
          ) : user && can(user.role, "maintenance.manage") ? (
            <Link href="/ocorrencias/manutencoes/nova" className="btn-primary">
              Nova manutenção
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex gap-4 border-b border-gray-200 text-sm">
        <Link
          href="/ocorrencias?tab=ocorrencias"
          className={cn("border-b-2 px-1 pb-2 font-medium", tab === "ocorrencias" ? "border-cepin-600 text-cepin-700" : "border-transparent text-gray-500")}
        >
          Ocorrências
        </Link>
        <Link
          href="/ocorrencias?tab=manutencao"
          className={cn("border-b-2 px-1 pb-2 font-medium", tab === "manutencao" ? "border-cepin-600 text-cepin-700" : "border-transparent text-gray-500")}
        >
          Manutenções
        </Link>
      </div>

      {tab === "ocorrencias" ? (
        incidents.length === 0 ? (
          <EmptyState title="Nenhuma ocorrência registrada" />
        ) : (
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Item</th>
                  <th>Tipo</th>
                  <th>Gravidade</th>
                  <th>Reportado por</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>
                      <Link href={`/ocorrencias/${inc.id}`} className="font-medium text-cepin-700 hover:underline">
                        {inc.code}
                      </Link>
                    </td>
                    <td>{inc.equipment?.name ?? inc.accessory?.name ?? inc.battery?.code ?? "-"}</td>
                    <td>{INCIDENT_TYPE_LABELS[inc.type] ?? inc.type}</td>
                    <td>
                      <Badge label={INCIDENT_SEVERITY_LABELS[inc.severity] ?? inc.severity} colorClass={INCIDENT_SEVERITY_COLORS[inc.severity]} />
                    </td>
                    <td>{inc.reportedBy.name}</td>
                    <td>{formatDate(inc.createdAt)}</td>
                    <td>
                      <Badge label={INCIDENT_STATUS_LABELS[inc.status] ?? inc.status} colorClass={INCIDENT_STATUS_COLORS[inc.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : maintenanceRecords.length === 0 ? (
        <EmptyState title="Nenhuma manutenção registrada" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Responsável</th>
                <th>Agendada para</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/ocorrencias/manutencoes/${m.id}`} className="font-medium text-cepin-700 hover:underline">
                      {m.code}
                    </Link>
                  </td>
                  <td>{m.equipment?.name ?? m.accessory?.name ?? m.battery?.code ?? "-"}</td>
                  <td>{MAINTENANCE_TYPE_LABELS[m.type] ?? m.type}</td>
                  <td>{m.responsible?.name ?? "-"}</td>
                  <td>{m.scheduledDate ? formatDate(m.scheduledDate) : "-"}</td>
                  <td>
                    <Badge label={MAINTENANCE_STATUS_LABELS[m.status] ?? m.status} colorClass={MAINTENANCE_STATUS_COLORS[m.status]} />
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
