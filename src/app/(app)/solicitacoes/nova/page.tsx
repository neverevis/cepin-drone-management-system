import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { ReservationForm } from "@/components/reservations/ReservationForm";

export default async function NewReservationPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "reservations.create")) redirect("/solicitacoes");

  const [equipmentOptions, projectOptions, batteryOptions] = await Promise.all([
    prisma.equipment.findMany({
      where: { status: { notIn: ["BAIXADO", "INDISPONIVEL"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.battery.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, isPrimary: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Nova solicitação" description="Solicite a retirada do drone para uma atividade." />
      <ReservationForm equipmentOptions={equipmentOptions} projectOptions={projectOptions} batteryOptions={batteryOptions} />
    </div>
  );
}
