import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { BatteryForm } from "@/components/battery/BatteryForm";
import { createBattery } from "@/lib/actions/battery";

export default async function NewBatteryPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "equipment.manage")) redirect("/baterias");

  return (
    <div>
      <PageHeader title="Nova bateria" description="Cadastre uma bateria inteligente de voo." />
      <BatteryForm action={createBattery} submitLabel="Cadastrar bateria" />
    </div>
  );
}
