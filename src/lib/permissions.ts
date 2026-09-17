import type { Role } from "./enums";

// ---------------------------------------------------------------------------
// Matriz de permissões central do sistema.
//
// IMPORTANTE: esta checagem é aplicada em cada Server Action (backend), não
// apenas para esconder botões na interface. Toda action que muda dados chama
// requirePermission()/assertRole() antes de tocar no banco.
// ---------------------------------------------------------------------------

export type Permission =
  | "equipment.manage" // cadastrar/editar/baixar equipamentos, acessórios e baterias
  | "equipment.view"
  | "users.manage"
  | "reservations.create"
  | "reservations.review" // aprovar/rejeitar
  | "reservations.cancel.own"
  | "withdrawals.register" // registrar retirada física (conferência de saída)
  | "withdrawals.view"
  | "flightlogs.register"
  | "battery.charge.register"
  | "battery.usage.register"
  | "returns.register" // registrar devolução física (conferência de entrada)
  | "returns.close" // encerrar devolução com pendências tratadas
  | "incidents.create"
  | "incidents.manage" // alterar status, providências, encerrar
  | "maintenance.manage"
  | "reports.view"
  | "settings.manage"
  | "audit.view";

const MATRIX: Record<Role, Permission[]> = {
  ADMIN: [
    "equipment.manage",
    "equipment.view",
    "users.manage",
    "reservations.create",
    "reservations.review",
    "reservations.cancel.own",
    "withdrawals.register",
    "withdrawals.view",
    "flightlogs.register",
    "battery.charge.register",
    "battery.usage.register",
    "returns.register",
    "returns.close",
    "incidents.create",
    "incidents.manage",
    "maintenance.manage",
    "reports.view",
    "settings.manage",
    "audit.view",
  ],
  RESPONSAVEL_CEPIN: [
    "equipment.view",
    "reservations.review",
    "withdrawals.view",
    "returns.register",
    "returns.close",
    "incidents.create",
    "incidents.manage",
    "reports.view",
    "audit.view",
  ],
  USUARIO_AUTORIZADO: [
    "equipment.view",
    "reservations.create",
    "reservations.cancel.own",
    "withdrawals.view",
    "flightlogs.register",
    "battery.charge.register",
    "battery.usage.register",
    "incidents.create",
    "reports.view",
  ],
  OPERADOR_CONFERENTE: [
    "equipment.view",
    "withdrawals.register",
    "withdrawals.view",
    "returns.register",
    "incidents.create",
    "battery.charge.register",
  ],
};

export function can(role: Role | string, permission: Permission): boolean {
  const perms = MATRIX[role as Role];
  return perms ? perms.includes(permission) : false;
}

export class ForbiddenError extends Error {
  constructor(message = "Você não tem permissão para executar esta ação.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertPermission(role: Role | string, permission: Permission) {
  if (!can(role, permission)) {
    throw new ForbiddenError();
  }
}
