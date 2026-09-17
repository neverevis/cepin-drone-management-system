import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { FlightLogForm } from "@/components/flightlogs/FlightLogForm";

export default async function NewFlightLogPage({
  searchParams,
}: {
  searchParams: { withdrawalId?: string };
}) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "flightlogs.register")) redirect("/utilizacoes");
  if (!searchParams.withdrawalId) redirect("/retiradas");

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: searchParams.withdrawalId },
    include: { items: { include: { battery: true } } },
  });
  if (!withdrawal) notFound();
  if (withdrawal.status !== "ABERTA") redirect(`/retiradas/${withdrawal.id}`);

  const projectOptions = await prisma.project.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const batteryOptions = withdrawal.items
    .filter((i) => i.battery)
    .map((i) => ({ id: i.battery!.id, code: i.battery!.code, currentChargePercent: i.battery!.currentChargePercent }));

  return (
    <div>
      <PageHeader title="Registrar utilização" description={`Retirada ${withdrawal.code}`} />
      <FlightLogForm withdrawalId={withdrawal.id} projectOptions={projectOptions} batteryOptions={batteryOptions} />
    </div>
  );
}
