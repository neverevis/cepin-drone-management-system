import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "settings.manage")) redirect("/");

  const settings = await getSettings();

  return (
    <div>
      <PageHeader title="Configurações" description="Parâmetros institucionais utilizados pelo sistema e pelos documentos gerados." />
      <SettingsForm settings={settings} />
    </div>
  );
}
