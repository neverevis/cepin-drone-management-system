import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { BATTERY_STATUS_COLORS, BATTERY_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function BatteryListPage() {
  const user = await getCurrentUser();
  const settings = await getSettings();
  const batteries = await prisma.battery.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <PageHeader
        title="Baterias"
        description="Controle individual de carga, ciclos e disponibilidade das baterias inteligentes."
        actions={
          user && can(user.role, "equipment.manage") ? (
            <Link href="/baterias/novo" className="btn-primary">
              Nova bateria
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {batteries.map((bat) => {
          const low = bat.currentChargePercent < settings.lowBatteryThresholdPercent;
          const nearLimit = (bat.cycleCount ?? 0) >= settings.batteryCycleWarningLimit;
          return (
            <Link key={bat.id} href={`/baterias/${bat.id}`} className="card block p-4 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {bat.code} {bat.isPrimary && <span className="text-xs text-gray-400">(principal)</span>}
                </h3>
                <Badge label={BATTERY_STATUS_LABELS[bat.status] ?? bat.status} colorClass={BATTERY_STATUS_COLORS[bat.status]} />
              </div>
              <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className={`h-2 rounded-full ${low ? "bg-red-500" : "bg-cepin-500"}`} style={{ width: `${bat.currentChargePercent}%` }} />
              </div>
              <p className="text-xs text-gray-500">
                {bat.currentChargePercent}% · {bat.cycleCount ?? 0} ciclos
                {nearLimit && <span className="ml-1 font-medium text-red-600">(próx. do limite)</span>}
              </p>
              <p className="mt-1 text-xs text-gray-400">Atualizado em {formatDateTime(bat.lastChargeUpdateAt)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
