import { prisma } from "./prisma";
import type { AuditAction } from "./enums";

export async function logAudit(params: {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      summary: params.summary,
      beforeJson: params.before !== undefined ? JSON.stringify(params.before) : null,
      afterJson: params.after !== undefined ? JSON.stringify(params.after) : null,
    },
  });
}
