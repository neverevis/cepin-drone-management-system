import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { WithdrawalForm } from "@/components/withdrawals/WithdrawalForm";

export default async function NewWithdrawalPage({
  searchParams,
}: {
  searchParams: { reservationId?: string };
}) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "withdrawals.register")) redirect("/retiradas");
  if (!searchParams.reservationId) redirect("/solicitacoes");

  const reservation = await prisma.reservation.findUnique({
    where: { id: searchParams.reservationId },
    include: {
      requester: true,
      batteries: { include: { battery: true } },
      withdrawal: true,
    },
  });

  if (!reservation) notFound();
  if (reservation.status !== "APROVADA" || reservation.withdrawal) {
    redirect(`/solicitacoes/${reservation.id}`);
  }

  const userOptions = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="Registrar retirada física" description={`Referente à solicitação ${reservation.code}`} />
      <WithdrawalForm reservation={reservation} userOptions={userOptions} />
    </div>
  );
}
