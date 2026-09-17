import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { ReturnForm } from "@/components/returns/ReturnForm";

export default async function NewReturnPage({
  searchParams,
}: {
  searchParams: { withdrawalId?: string };
}) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "returns.register")) redirect("/devolucoes");
  if (!searchParams.withdrawalId) redirect("/retiradas");

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: searchParams.withdrawalId },
    include: { items: { include: { battery: true } }, return: true },
  });
  if (!withdrawal) notFound();
  if (withdrawal.status !== "ABERTA" || withdrawal.return) redirect(`/retiradas/${withdrawal.id}`);

  const userOptions = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="Registrar devolução" description={`Referente à retirada ${withdrawal.code}`} />
      <ReturnForm withdrawal={withdrawal} userOptions={userOptions} />
    </div>
  );
}
