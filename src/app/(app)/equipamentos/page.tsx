import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { EQUIPMENT_STATUS_COLORS, EQUIPMENT_STATUS_LABELS } from "@/lib/constants";

export default async function EquipmentListPage() {
  const user = await getCurrentUser();
  const equipmentList = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    include: { accessories: true },
  });

  return (
    <div>
      <PageHeader
        title="Equipamentos"
        description="Cadastro patrimonial do drone e demais equipamentos do CEPIN."
        actions={
          user && can(user.role, "equipment.manage") ? (
            <Link href="/equipamentos/novo" className="btn-primary">
              Novo equipamento
            </Link>
          ) : undefined
        }
      />

      {equipmentList.length === 0 ? (
        <EmptyState title="Nenhum equipamento cadastrado" description="Cadastre o drone e seus acessórios para começar." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipmentList.map((eq) => (
            <Link
              key={eq.id}
              href={`/equipamentos/${eq.id}`}
              className="card block p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900">{eq.name}</h3>
                <Badge label={EQUIPMENT_STATUS_LABELS[eq.status] ?? eq.status} colorClass={EQUIPMENT_STATUS_COLORS[eq.status]} />
              </div>
              <dl className="space-y-1 text-sm text-gray-500">
                {eq.model && (
                  <div>
                    <dt className="inline font-medium text-gray-600">Modelo: </dt>
                    <dd className="inline">{eq.model}</dd>
                  </div>
                )}
                {eq.serialNumber && (
                  <div>
                    <dt className="inline font-medium text-gray-600">Nº de série: </dt>
                    <dd className="inline">{eq.serialNumber}</dd>
                  </div>
                )}
                <div>
                  <dt className="inline font-medium text-gray-600">Acessórios: </dt>
                  <dd className="inline">{eq.accessories.length}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
