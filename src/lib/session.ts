import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { ForbiddenError, can, type Permission } from "./permissions";
import type { Role } from "./enums";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role as Role,
  };
}

/** Usar dentro de Server Actions: lança erro se não houver sessão. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada. Faça login novamente.");
  return user;
}

/** Usar dentro de Server Actions: valida sessão + permissão específica. */
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new ForbiddenError();
  }
  return user;
}
