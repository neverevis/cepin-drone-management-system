import Link from "next/link";
import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  BATTERY_STATUS_COLORS,
  BATTERY_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatMinutes } from "@/lib/utils";

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600"
      : tone === "danger"
      ? "text-red-600"
      : tone === "success"
      ? "text-green-600"
      : "text-gray-900";
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const settings = await getSettings();
  const periodStart = subDays(new Date(), 30);

  const [
    equipmentList,
    batteries,
    upcomingReservations,
    ongoingReservations,
    pendingApproval,
    openWithdrawals,
    openIncidents,
    pendingReturns,
    recentFlightLogs,
  ] = await Promise.all([
    prisma.equipment.findMany({ orderBy: { name: "asc" } }),
    prisma.battery.findMany({ orderBy: { code: "asc" } }),
    prisma.reservation.findMany({
      where: { status: "APROVADA", scheduledPickupAt: { gte: new Date() } },
      orderBy: { scheduledPickupAt: "asc" },
      take: 5,
      include: { requester: true, equipment: true },
    }),
    prisma.reservation.findMany({
      where: { status: { in: ["RETIRADA", "EM_USO"] } },
      orderBy: { scheduledPickupAt: "asc" },
      include: { requester: true, equipment: true },
    }),
    prisma.reservation.count({ where: { status: { in: ["SOLICITADA", "EM_ANALISE"] } } }),
    prisma.withdrawal.count({ where: { status: "ABERTA" } }),
    prisma.incident.count({ where: { status: { in: ["ABERTA", "EM_ANALISE", "EM_PROVIDENCIA"] } } }),
    prisma.return.count({ where: { closedAt: null } }),
    prisma.flightLog.findMany({
      where: { date: { gte: periodStart } },
      select: { durationMinutes: true },
    }),
  ]);

  const totalMinutes = recentFlightLogs.reduce((sum, f) => sum + f.durationMinutes, 0);
  const availableEquipment = equipmentList.filter((e) => e.status === "DISPONIVEL").length;
  const lowBatteries = batteries.filter(
    (b) => b.currentChargePercent < settings.lowBatteryThresholdPercent
  );
  const batteriesNearCycleLimit = batteries.filter(
    (b) => (b.cycleCount ?? 0) >= settings.batteryCycleWarningLimit
  );

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0] ?? ""}`}
        description="Visão geral do drone DJI Mavic 3 Multispectral e seus acessórios."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Equipamentos disponíveis" value={`${availableEquipment}/${equipmentList.length}`} />
        <StatCard
          label="Retiradas em andamento"
          value={openWithdrawals}
          tone={openWithdrawals > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Solicitações aguardando análise"
          value={pendingApproval}
          tone={pendingApproval > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Ocorrências em aberto"
          value={openIncidents}
          tone={openIncidents > 0 ? "danger" : "success"}
        />
        <StatCard label="Horas de uso (últimos 30 dias)" value={formatMinutes(totalMinutes)} />
        <StatCard label="Atividades registradas (30 dias)" value={recentFlightLogs.length} />
        <StatCard
          label="Baterias com carga baixa"
          value={lowBatteries.length}
          hint={`limiar: ${settings.lowBatteryThresholdPercent}%`}
          tone={lowBatteries.length > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Devoluções com pendências"
          value={pendingReturns}
          tone={pendingReturns > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Situação do equipamento</h2>
          <ul className="space-y-2">
            {equipmentList.map((eq) => (
              <li key={eq.id} className="flex items-center justify-between text-sm">
                <Link href={`/equipamentos/${eq.id}`} className="text-gray-700 hover:text-cepin-700">
                  {eq.name}
                </Link>
                <Badge
                  label={EQUIPMENT_STATUS_LABELS[eq.status] ?? eq.status}
                  colorClass={EQUIPMENT_STATUS_COLORS[eq.status]}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Situação das baterias</h2>
          <ul className="space-y-3">
            {batteries.map((bat) => {
              const low = bat.currentChargePercent < settings.lowBatteryThresholdPercent;
              const nearLimit = (bat.cycleCount ?? 0) >= settings.batteryCycleWarningLimit;
              return (
                <li key={bat.id}>
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/baterias/${bat.id}`} className="font-medium text-gray-700 hover:text-cepin-700">
                      {bat.code} {bat.isPrimary && <span className="text-xs text-gray-400">(principal)</span>}
                    </Link>
                    <div className="flex items-center gap-2">
                      {nearLimit && <Badge label="Ciclos próximos do limite" colorClass="bg-red-100 text-red-800 border-red-300" />}
                      <Badge label={BATTERY_STATUS_LABELS[bat.status] ?? bat.status} colorClass={BATTERY_STATUS_COLORS[bat.status]} />
                    </div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${low ? "bg-red-500" : "bg-cepin-500"}`}
                      style={{ width: `${bat.currentChargePercent}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {bat.currentChargePercent}% de carga · {bat.cycleCount ?? 0} ciclos informados
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Próximas retiradas aprovadas</h2>
          {upcomingReservations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma retirada aprovada agendada.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingReservations.map((r) => (
                <li key={r.id} className="text-sm">
                  <Link href={`/solicitacoes/${r.id}`} className="font-medium text-gray-700 hover:text-cepin-700">
                    {r.code}
                  </Link>{" "}
                  · {r.requester.name} · {formatDateTime(r.scheduledPickupAt)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Retiradas em andamento</h2>
          {ongoingReservations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma retirada em andamento no momento.</p>
          ) : (
            <ul className="space-y-2">
              {ongoingReservations.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <Link href={`/solicitacoes/${r.id}`} className="font-medium text-gray-700 hover:text-cepin-700">
                    {r.code} · {r.requester.name}
                  </Link>
                  <Badge label={RESERVATION_STATUS_LABELS[r.status] ?? r.status} colorClass={RESERVATION_STATUS_COLORS[r.status]} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {batteriesNearCycleLimit.length > 0 && (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <strong>Atenção:</strong> {batteriesNearCycleLimit.map((b) => b.code).join(", ")}{" "}
          {batteriesNearCycleLimit.length === 1 ? "está" : "estão"} próxima(s) do limite de
          200 ciclos de carga recomendado pela DJI. Considere planejar a substituição.
        </div>
      )}
    </div>
  );
}
