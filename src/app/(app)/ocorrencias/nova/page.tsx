import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getTargetOptions } from "@/lib/targetOptions";
import { PageHeader } from "@/components/PageHeader";
import { IncidentForm } from "@/components/incidents/IncidentForm";

export default async function NewIncidentPage({
  searchParams,
}: {
  searchParams: { equipmentId?: string };
}) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "incidents.create")) redirect("/ocorrencias");

  const options = await getTargetOptions();
  const defaultTarget = searchParams.equipmentId ? `equipment:${searchParams.equipmentId}` : undefined;

  return (
    <div>
      <PageHeader title="Nova ocorrência" description="Registre avarias, falhas, perdas, furtos ou acidentes." />
      <IncidentForm options={options} defaultTarget={defaultTarget} />
    </div>
  );
}
