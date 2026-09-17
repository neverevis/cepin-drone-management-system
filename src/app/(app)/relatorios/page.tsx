import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getUsageReport, getBatteryReport, getAssetReport, getWithdrawalReport, type ReportFilters } from "@/lib/reports";
import {
  EQUIPMENT_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  FLIGHT_ACTIVITY_TYPE_LABELS,
  WITHDRAWAL_STATUS_COLORS,
  WITHDRAWAL_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatMinutes, cn, toQueryString } from "@/lib/utils";
import { redirect } from "next/navigation";

type Tab = "utilizacao" | "baterias" | "patrimonio" | "retiradas" | "auditoria";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { tab?: string; dateFrom?: string; dateTo?: string; projectId?: string; userId?: string; status?: string };
}) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reports.view")) redirect("/");

  const tab: Tab = (["utilizacao", "baterias", "patrimonio", "retiradas", "auditoria"] as Tab[]).includes(
    searchParams.tab as Tab
  )
    ? (searchParams.tab as Tab)
    : "utilizacao";

  const filters: ReportFilters = {
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    projectId: searchParams.projectId,
    userId: searchParams.userId,
    status: searchParams.status,
  };

  const [projects, users] = await Promise.all([
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "utilizacao", label: "Utilização" },
    { key: "baterias", label: "Baterias" },
    { key: "patrimonio", label: "Patrimonial" },
    { key: "retiradas", label: "Retiradas" },
  ];
  if (can(user.role, "audit.view")) tabs.push({ key: "auditoria", label: "Auditoria" });

  return (
    <div>
      <PageHeader title="Relatórios" description="Consultas e exportação de dados para prestação de contas institucional." />

      <div className="mb-4 flex flex-wrap gap-4 border-b border-gray-200 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/relatorios?tab=${t.key}`}
            className={cn(
              "border-b-2 px-1 pb-2 font-medium",
              tab === t.key ? "border-cepin-600 text-cepin-700" : "border-transparent text-gray-500"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab !== "baterias" && tab !== "patrimonio" && tab !== "auditoria" && (
        <form method="get" className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-5">
          <input type="hidden" name="tab" value={tab} />
          <div>
            <label className="label">De</label>
            <input type="date" name="dateFrom" defaultValue={searchParams.dateFrom} className="input" />
          </div>
          <div>
            <label className="label">Até</label>
            <input type="date" name="dateTo" defaultValue={searchParams.dateTo} className="input" />
          </div>
          {tab === "utilizacao" && (
            <div>
              <label className="label">Projeto</label>
              <select name="projectId" defaultValue={searchParams.projectId} className="input">
                <option value="">Todos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Usuário</label>
            <select name="userId" defaultValue={searchParams.userId} className="input">
              <option value="">Todos</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          {tab === "retiradas" && (
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={searchParams.status} className="input">
                <option value="">Todos</option>
                <option value="ABERTA">Em aberto</option>
                <option value="DEVOLVIDA">Devolvida</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              Filtrar
            </button>
          </div>
        </form>
      )}

      {tab === "utilizacao" && <UsageTab filters={filters} />}
      {tab === "baterias" && <BatteryTab />}
      {tab === "patrimonio" && <AssetTab />}
      {tab === "retiradas" && <WithdrawalTab filters={filters} />}
      {tab === "auditoria" && can(user.role, "audit.view") && <AuditTab filters={filters} />}
    </div>
  );
}

async function UsageTab({ filters }: { filters: ReportFilters }) {
  const logs = await getUsageReport(filters);
  const totalMinutes = logs.reduce((s, l) => s + l.durationMinutes, 0);
  const qs = toQueryString({ ...filters });

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-gray-500">
          {logs.length} atividades · {formatMinutes(totalMinutes)} totais
        </p>
        <a href={`/api/relatorios/utilizacao/csv?${qs}`} className="btn-secondary">
          Exportar CSV
        </a>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Data</th>
            <th>Operador</th>
            <th>Projeto</th>
            <th>Local</th>
            <th>Duração</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{formatDate(l.date)}</td>
              <td>{l.operator.name}</td>
              <td>{l.project?.name ?? "-"}</td>
              <td>{l.location ?? "-"}</td>
              <td>{formatMinutes(l.durationMinutes)}</td>
              <td>{FLIGHT_ACTIVITY_TYPE_LABELS[l.activityType] ?? l.activityType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function BatteryTab() {
  const batteries = await getBatteryReport();
  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-gray-500">{batteries.length} baterias cadastradas</p>
        <a href="/api/relatorios/baterias/csv" className="btn-secondary">
          Exportar CSV
        </a>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Código</th>
            <th>Carga atual</th>
            <th>Ciclos</th>
            <th>Carregamentos</th>
            <th>Usos registrados</th>
            <th>Ocorrências</th>
            <th>Manutenções</th>
          </tr>
        </thead>
        <tbody>
          {batteries.map((b) => (
            <tr key={b.id}>
              <td>{b.code}</td>
              <td>{b.currentChargePercent}%</td>
              <td>{b.cycleCount ?? 0}</td>
              <td>{b._count.chargeRecords}</td>
              <td>{b._count.usageRecords}</td>
              <td>{b._count.incidents}</td>
              <td>{b._count.maintenanceRecords}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function AssetTab() {
  const equipmentList = await getAssetReport();
  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-gray-500">{equipmentList.length} equipamentos cadastrados</p>
        <a href="/api/relatorios/patrimonio/csv" className="btn-secondary">
          Exportar CSV
        </a>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Situação</th>
            <th>Acessórios</th>
            <th>Responsável atual</th>
            <th>Retiradas</th>
            <th>Ocorrências</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>
                <Badge label={EQUIPMENT_STATUS_LABELS[e.status] ?? e.status} colorClass={EQUIPMENT_STATUS_COLORS[e.status]} />
              </td>
              <td>{e.accessories.length}</td>
              <td>{e.withdrawals[0]?.responsibleUser.name ?? "-"}</td>
              <td>{e._count.reservations}</td>
              <td>{e._count.incidents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function WithdrawalTab({ filters }: { filters: ReportFilters }) {
  const withdrawals = await getWithdrawalReport(filters);
  const qs = toQueryString({ ...filters });

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-gray-500">{withdrawals.length} retiradas</p>
        <a href={`/api/relatorios/retiradas/csv?${qs}`} className="btn-secondary">
          Exportar CSV
        </a>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Termo</th>
            <th>Processo SUAP</th>
            <th>Responsável</th>
            <th>Retirado em</th>
            <th>Devolvido em</th>
            <th>Status</th>
            <th>Pendências</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id}>
              <td>{w.code}</td>
              <td>{w.suapProcessNumber ?? "-"}</td>
              <td>{w.responsibleUser.name}</td>
              <td>{formatDateTime(w.checkoutAt)}</td>
              <td>{w.return ? formatDateTime(w.return.returnedAt) : "-"}</td>
              <td>
                <Badge label={WITHDRAWAL_STATUS_LABELS[w.status] ?? w.status} colorClass={WITHDRAWAL_STATUS_COLORS[w.status]} />
              </td>
              <td>{w.return?.pendencies ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function AuditTab({ filters }: { filters: ReportFilters }) {
  const range =
    filters.dateFrom || filters.dateTo
      ? {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom + "T00:00:00") } : {}),
          ...(filters.dateTo ? { lte: new Date(filters.dateTo + "T23:59:59") } : {}),
        }
      : undefined;

  const logs = await prisma.auditLog.findMany({
    where: range ? { createdAt: range } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 200,
  });

  return (
    <div className="card overflow-x-auto">
      <div className="p-4">
        <p className="text-sm text-gray-500">{logs.length} registros de auditoria (últimos 200)</p>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th>Data</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Entidade</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{formatDateTime(l.createdAt)}</td>
              <td>{l.user?.name ?? "Sistema"}</td>
              <td>{l.action}</td>
              <td>{l.entityType}</td>
              <td>{l.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
