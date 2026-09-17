import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getUsageReport } from "@/lib/reports";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/utils";
import { FLIGHT_ACTIVITY_TYPE_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reports.view")) return new Response("Não autorizado.", { status: 403 });

  const { searchParams } = new URL(req.url);
  const logs = await getUsageReport({
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    projectId: searchParams.get("projectId") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
  });

  const csv = toCsv(
    ["Data", "Operador", "Projeto", "Local", "Duração (min)", "Tipo", "Retirada"],
    logs.map((l) => [
      formatDate(l.date),
      l.operator.name,
      l.project?.name ?? "",
      l.location ?? "",
      l.durationMinutes,
      FLIGHT_ACTIVITY_TYPE_LABELS[l.activityType] ?? l.activityType,
      l.withdrawal.code,
    ])
  );

  return csvResponse(csv, "relatorio-utilizacao.csv");
}
