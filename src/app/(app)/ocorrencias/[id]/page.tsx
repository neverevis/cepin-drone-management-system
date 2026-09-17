import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { IncidentManageForm } from "@/components/incidents/IncidentManageForm";
import {
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_COLORS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: { equipment: true, accessory: true, battery: true, reportedBy: true },
  });

  if (!incident || !user) notFound();

  const canManage = can(user.role, "incidents.manage");
  const itemLabel = incident.equipment?.name ?? incident.accessory?.name ?? incident.battery?.code ?? "-";

  return (
    <div>
      <PageHeader
        title={`Ocorrência ${incident.code}`}
        actions={<Badge label={INCIDENT_STATUS_LABELS[incident.status] ?? incident.status} colorClass={INCIDENT_STATUS_COLORS[incident.status]} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-2">
          <Row label="Item afetado" value={itemLabel} />
          <Row label="Tipo" value={INCIDENT_TYPE_LABELS[incident.type] ?? incident.type} />
          <Row
            label="Gravidade"
            valueNode={<Badge label={INCIDENT_SEVERITY_LABELS[incident.severity] ?? incident.severity} colorClass={INCIDENT_SEVERITY_COLORS[incident.severity]} />}
          />
          <Row label="Reportado por" value={incident.reportedBy.name} />
          <Row label="Data" value={formatDateTime(incident.createdAt)} />
          <Row label="Descrição" value={incident.description} />
          {incident.providences && <Row label="Providências" value={incident.providences} />}
          {incident.blocksEquipment && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              O item está bloqueado (indisponível) em razão desta ocorrência.
            </p>
          )}
        </div>

        {canManage && (
          <IncidentManageForm
            incidentId={incident.id}
            status={incident.status}
            providences={incident.providences}
            blocksEquipment={incident.blocksEquipment}
            hasLinkedItem={!!(incident.equipmentId || incident.accessoryId || incident.batteryId)}
          />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueNode }: { label: string; value?: string | null; valueNode?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800 sm:text-right">{valueNode ?? value ?? "-"}</dd>
    </div>
  );
}
