import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { ROLE_LABELS } from "@/lib/constants";
import { ToggleActiveButton, ResetPasswordForm } from "@/components/users/UserActions";

export default async function UsersListPage() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "users.manage")) redirect("/");

  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gestão de perfis de acesso do sistema."
        actions={
          <Link href="/usuarios/novo" className="btn-primary">
            Novo usuário
          </Link>
        }
      />

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Matrícula</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium text-gray-800">{u.name}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                <td>{u.registration ?? "-"}</td>
                <td>
                  <Badge
                    label={u.active ? "Ativo" : "Inativo"}
                    colorClass={u.active ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}
                  />
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <Link href={`/usuarios/${u.id}/editar`} className="text-xs font-medium text-cepin-700 hover:underline">
                      Editar
                    </Link>
                    {u.id !== user.id && <ToggleActiveButton userId={u.id} active={u.active} />}
                    <ResetPasswordForm userId={u.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
