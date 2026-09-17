import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { NAV_ITEMS } from "@/lib/nav";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = NAV_ITEMS.filter((item) => !item.permission || can(user.role, item.permission));

  return (
    <AppShell items={items} name={user.name} role={user.role}>
      {children}
    </AppShell>
  );
}
