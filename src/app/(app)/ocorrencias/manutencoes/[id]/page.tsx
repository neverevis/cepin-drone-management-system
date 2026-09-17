import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { MaintenanceManageForm } from "@/components/maintenance/MaintenanceManageForm";
import { MAINTENANCE_STATUS_COLORS, MAINTENANCE_STATUS_LABELS, MAINTENANCE_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function MaintenanceDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const record = await prisma.maintenanceRecord.findUnique({
    where: { id: params.id },
    include: { equipment: true, accessory: true, battery: true, responsible: true },
  });

  if (!record || !user) notFound();

  const canManage = can(user.role, "maintenance.manage");
  const itemLabel = record.equipment?.name ?? record.accessory?.name ?? record.battery?.code ?? "-";

  return (
    <div>
      <PageHeader
        title={`Manutenção ${record.code}`}
        actions={<Badge label={MAINTENANCE_STATUS_LABELS[record.status] ?? record.status} colorClass={MAINTENANCE_STATUS_COLORS[record.status]} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-2">
          <Row label="Item" value={itemLabel} />
          <Row label="Tipo" value={MAINTENANCE_TYPE_LABELS[record.type] ?? record.type} />
          <Row label="Responsável" value={record.responsible?.name} />
          <Row label="Prestador externo" value={record.externalProvider} />
          <Row label="Data agendada" value={record.scheduledDate ? formatDate(record.scheduledDate) : undefined} />
          <Row label="Concluída em" value={record.completedDate ? formatDate(record.completedDate) : undefined} />
          <Row label="Custo" value={record.cost ? `R$ ${record.cost.toFixed(2)}` : undefined} />
          <Row label="Descrição" value={record.description} />
        </div>

        {canManage && (
          <MaintenanceManageForm maintenanceId={record.id} status={record.status} description={record.description} cost={record.cost} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800 sm:text-right">{value}</dd>
    </div>
  );
}
