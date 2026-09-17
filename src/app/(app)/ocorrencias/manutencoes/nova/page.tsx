import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getTargetOptions } from "@/lib/targetOptions";
import { PageHeader } from "@/components/PageHeader";
import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm";

export default async function NewMaintenancePage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "maintenance.manage")) redirect("/ocorrencias?tab=manutencao");

  const [options, userOptions] = await Promise.all([
    getTargetOptions(),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Nova manutenção" description="Registre uma manutenção preventiva, corretiva ou calibração." />
      <MaintenanceForm options={options} userOptions={userOptions} />
    </div>
  );
}
