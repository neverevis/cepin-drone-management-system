import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { updateEquipment } from "@/lib/actions/equipment";

export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "equipment.manage")) redirect(`/equipamentos/${params.id}`);

  const equipment = await prisma.equipment.findUnique({ where: { id: params.id } });
  if (!equipment) notFound();

  const action = updateEquipment.bind(null, equipment.id);

  return (
    <div>
      <PageHeader title={`Editar: ${equipment.name}`} />
      <EquipmentForm action={action} defaults={equipment} submitLabel="Salvar alterações" />
    </div>
  );
}
