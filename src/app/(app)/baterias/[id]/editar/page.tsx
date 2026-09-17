import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { BatteryForm } from "@/components/battery/BatteryForm";
import { updateBattery } from "@/lib/actions/battery";

export default async function EditBatteryPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "equipment.manage")) redirect(`/baterias/${params.id}`);

  const battery = await prisma.battery.findUnique({ where: { id: params.id } });
  if (!battery) notFound();

  const action = updateBattery.bind(null, battery.id);

  return (
    <div>
      <PageHeader title={`Editar bateria ${battery.code}`} />
      <BatteryForm action={action} defaults={battery} submitLabel="Salvar alterações" />
    </div>
  );
}
