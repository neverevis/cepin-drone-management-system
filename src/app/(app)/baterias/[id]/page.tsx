import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { BatteryChargeChart, type ChargePoint } from "@/components/battery/BatteryChargeChart";
import { StartChargeForm, FinishChargeForm, UsageForm } from "@/components/battery/ChargeActions";
import { BATTERY_STATUS_COLORS, BATTERY_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export default async function BatteryDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const settings = await getSettings();

  const battery = await prisma.battery.findUnique({
    where: { id: params.id },
    include: {
      chargeRecords: { orderBy: { startedAt: "desc" }, include: { recordedBy: true } },
      usageRecords: {
        orderBy: { createdAt: "desc" },
        include: { recordedBy: true, flightLog: true, withdrawal: true },
      },
    },
  });

  if (!battery) notFound();

  const canManage = user && can(user.role, "equipment.manage");
  const canCharge = user && can(user.role, "battery.charge.register");
  const canUsage = user && can(user.role, "battery.usage.register");

  const ongoingCharge = battery.chargeRecords.find((r) => !r.finishedAt);

  const chargePoints: ChargePoint[] = [
    ...battery.chargeRecords.flatMap((r) => {
      const points: ChargePoint[] = [
        {
          date: formatDateTime(r.startedAt).slice(0, 16),
          percent: r.chargeBefore,
          label: `Início do carregamento: ${r.chargeBefore}%`,
        },
      ];
      if (r.finishedAt && r.chargeAfter !== null) {
        points.push({
          date: formatDateTime(r.finishedAt).slice(0, 16),
          percent: r.chargeAfter,
          label: `Fim do carregamento: ${r.chargeAfter}%`,
        });
      }
      return points;
    }),
    ...battery.usageRecords.flatMap((u) => {
      const points: ChargePoint[] = [
        {
          date: formatDateTime(u.createdAt).slice(0, 16),
          percent: u.chargeBefore,
          label: `Antes do uso: ${u.chargeBefore}%`,
        },
      ];
      if (u.chargeAfter !== null) {
        points.push({
          date: formatDateTime(u.createdAt).slice(0, 16),
          percent: u.chargeAfter,
          label: `Depois do uso: ${u.chargeAfter}%`,
        });
      }
      return points;
    }),
  ].sort((a, b) => (a.date > b.date ? 1 : -1));

  const low = battery.currentChargePercent < settings.lowBatteryThresholdPercent;
  const nearLimit = (battery.cycleCount ?? 0) >= settings.batteryCycleWarningLimit;

  return (
    <div>
      <PageHeader
        title={`Bateria ${battery.code}${battery.isPrimary ? " (principal)" : ""}`}
        actions={
          canManage ? (
            <Link href={`/baterias/${battery.id}/editar`} className="btn-secondary">
              Editar
            </Link>
          ) : undefined
        }
      />

      {nearLimit && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Esta bateria está com {battery.cycleCount} ciclos informados, próxima ou acima do limite de
          200 ciclos recomendado pela DJI. Considere planejar sua substituição.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Situação atual</h2>
            <Badge label={BATTERY_STATUS_LABELS[battery.status] ?? battery.status} colorClass={BATTERY_STATUS_COLORS[battery.status]} />
          </div>
          <div className="mb-1 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div className={`h-3 rounded-full ${low ? "bg-red-500" : "bg-cepin-500"}`} style={{ width: `${battery.currentChargePercent}%` }} />
          </div>
          <p className="mb-3 text-sm text-gray-600">{battery.currentChargePercent}% de carga atual</p>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Ciclos informados</dt>
              <dd className="font-medium text-gray-800">{battery.cycleCount ?? 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Modelo</dt>
              <dd className="font-medium text-gray-800">{battery.model ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Nº de série</dt>
              <dd className="font-medium text-gray-800">{battery.serialNumber ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Última atualização</dt>
              <dd className="font-medium text-gray-800">{formatDateTime(battery.lastChargeUpdateAt)}</dd>
            </div>
          </dl>
          {battery.notes && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 p-3 text-xs text-gray-600">{battery.notes}</p>}

          {(canCharge || canUsage) && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {canCharge && !ongoingCharge && (
                <StartChargeForm batteryId={battery.id} currentCharge={battery.currentChargePercent} />
              )}
              {ongoingCharge && canCharge && (
                <FinishChargeForm batteryId={battery.id} recordId={ongoingCharge.id} chargeBefore={ongoingCharge.chargeBefore} />
              )}
              {canUsage && <UsageForm batteryId={battery.id} currentCharge={battery.currentChargePercent} />}
            </div>
          )}
        </div>

        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Evolução da carga</h2>
          <BatteryChargeChart data={chargePoints} />
        </div>

        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Histórico de carregamento</h2>
          {battery.chargeRecords.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum carregamento registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Carga antes</th>
                    <th>Carga depois</th>
                    <th>Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {battery.chargeRecords.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDateTime(r.startedAt)}</td>
                      <td>{r.finishedAt ? formatDateTime(r.finishedAt) : <Badge label="Em andamento" colorClass="bg-violet-100 text-violet-800 border-violet-300" />}</td>
                      <td>{r.chargeBefore}%</td>
                      <td>{r.chargeAfter !== null ? `${r.chargeAfter}%` : "-"}</td>
                      <td>{r.recordedBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Histórico de utilização</h2>
          {battery.usageRecords.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum uso registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Carga antes</th>
                    <th>Carga depois</th>
                    <th>Ciclos informados</th>
                    <th>Atividade</th>
                    <th>Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {battery.usageRecords.map((u) => (
                    <tr key={u.id}>
                      <td>{formatDateTime(u.createdAt)}</td>
                      <td>{u.chargeBefore}%</td>
                      <td>{u.chargeAfter !== null ? `${u.chargeAfter}%` : "-"}</td>
                      <td>{u.cyclesReported ?? "-"}</td>
                      <td>
                        {u.flightLog ? (
                          <Link href={`/utilizacoes/${u.flightLog.id}`} className="text-cepin-700 hover:underline">
                            {u.flightLog.activityNumber}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{u.recordedBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
