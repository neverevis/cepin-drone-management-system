import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getWithdrawalReport } from "@/lib/reports";
import { toCsv, csvResponse } from "@/lib/csv";
import { formatDateTime } from "@/lib/utils";
import { WITHDRAWAL_STATUS_LABELS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reports.view")) return new Response("Não autorizado.", { status: 403 });

  const { searchParams } = new URL(req.url);
  const withdrawals = await getWithdrawalReport({
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    projectId: searchParams.get("projectId") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  const csv = toCsv(
    ["Termo", "Processo SUAP", "Responsável", "Retirado em", "Devolvido em", "Status", "Pendências"],
    withdrawals.map((w) => [
      w.code,
      w.suapProcessNumber ?? "",
      w.responsibleUser.name,
      formatDateTime(w.checkoutAt),
      w.return ? formatDateTime(w.return.returnedAt) : "",
      WITHDRAWAL_STATUS_LABELS[w.status] ?? w.status,
      w.return?.pendencies ?? "",
    ])
  );

  return csvResponse(csv, "relatorio-retiradas.csv");
}
