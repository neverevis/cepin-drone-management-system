import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { UserForm } from "@/components/users/UserForm";
import { updateUser } from "@/lib/actions/users";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !can(currentUser.role, "users.manage")) redirect("/");

  const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
  if (!targetUser) notFound();

  const action = updateUser.bind(null, targetUser.id);

  return (
    <div>
      <PageHeader title={`Editar usuário: ${targetUser.name}`} />
      <UserForm action={action} defaults={targetUser} mode="edit" submitLabel="Salvar alterações" />
    </div>
  );
}
