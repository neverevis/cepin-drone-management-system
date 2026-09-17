import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getAssetReport } from "@/lib/reports";
import { toCsv, csvResponse } from "@/lib/csv";
import { EQUIPMENT_STATUS_LABELS } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reports.view")) return new Response("Não autorizado.", { status: 403 });

  const equipmentList = await getAssetReport();

  const csv = toCsv(
    ["Equipamento", "Nº de patrimônio", "Nº de série", "Situação", "Acessórios", "Responsável atual", "Retiradas", "Ocorrências", "Manutenções"],
    equipmentList.map((e) => [
      e.name,
      e.patrimonyNumber ?? "",
      e.serialNumber ?? "",
      EQUIPMENT_STATUS_LABELS[e.status] ?? e.status,
      e.accessories.length,
      e.withdrawals[0]?.responsibleUser.name ?? "",
      e._count.reservations,
      e._count.incidents,
      e._count.maintenanceRecords,
    ])
  );

  return csvResponse(csv, "relatorio-patrimonio.csv");
}
