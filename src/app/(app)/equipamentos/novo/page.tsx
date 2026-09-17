import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { createEquipment } from "@/lib/actions/equipment";

export default async function NewEquipmentPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "equipment.manage")) redirect("/equipamentos");

  return (
    <div>
      <PageHeader title="Novo equipamento" description="Cadastre um equipamento no patrimônio do CEPIN." />
      <EquipmentForm action={createEquipment} submitLabel="Cadastrar equipamento" />
    </div>
  );
}
