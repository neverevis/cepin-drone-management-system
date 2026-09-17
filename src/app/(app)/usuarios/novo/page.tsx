import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { UserForm } from "@/components/users/UserForm";
import { createUser } from "@/lib/actions/users";

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "users.manage")) redirect("/");

  return (
    <div>
      <PageHeader title="Novo usuário" description="Cadastre um novo usuário e defina seu perfil de acesso." />
      <UserForm action={createUser} mode="create" submitLabel="Cadastrar usuário" />
    </div>
  );
}
