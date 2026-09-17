import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getBatteryReport } from "@/lib/reports";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatDateTime } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reports.view")) return new Response("Não autorizado.", { status: 403 });

  const batteries = await getBatteryReport();

  const csv = toCsv(
    ["Código", "Principal", "Status", "Carga atual (%)", "Ciclos", "Última atualização", "Carregamentos", "Usos", "Ocorrências", "Manutenções"],
    batteries.map((b) => [
      b.code,
      b.isPrimary ? "Sim" : "Não",
      b.status,
      b.currentChargePercent,
      b.cycleCount ?? 0,
      formatDateTime(b.lastChargeUpdateAt),
      b._count.chargeRecords,
      b._count.usageRecords,
      b._count.incidents,
      b._count.maintenanceRecords,
    ])
  );

  return csvResponse(csv, "relatorio-baterias.csv");
}
