"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { ROLES } from "@/lib/enums";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const createUserSchema = z.object({
  name: z.string().min(2, "Informe o nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  role: z.enum(ROLES),
  registration: z.string().optional(),
  position: z.string().optional(),
  sector: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requirePermission("users.manage");
    const data = createUserSchema.parse(Object.fromEntries(formData));

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) return { error: "Já existe um usuário cadastrado com este e-mail." };

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        registration: data.registration || null,
        position: data.position || null,
        sector: data.sector || null,
        phone: data.phone || null,
      },
    });

    await logAudit({
      userId: admin.id,
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      summary: `${admin.name} cadastrou o usuário ${user.name} (${user.role})`,
      after: { ...user, passwordHash: undefined },
    });

    revalidatePath("/usuarios");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/usuarios");
}

const updateUserSchema = z.object({
  name: z.string().min(2, "Informe o nome completo."),
  role: z.enum(ROLES),
  registration: z.string().optional(),
  position: z.string().optional(),
  sector: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateUser(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requirePermission("users.manage");
    const data = updateUserSchema.parse(Object.fromEntries(formData));
    const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role,
        registration: data.registration || null,
        position: data.position || null,
        sector: data.sector || null,
        phone: data.phone || null,
      },
    });

    await logAudit({
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `${admin.name} atualizou o cadastro de ${user.name}`,
      before: { ...before, passwordHash: undefined },
      after: { ...user, passwordHash: undefined },
    });

    revalidatePath("/usuarios");
  } catch (err) {
    return { error: parseFormError(err) };
  }
  redirect("/usuarios");
}

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionState> {
  try {
    const admin = await requirePermission("users.manage");
    if (admin.id === userId) return { error: "Você não pode inativar seu próprio usuário." };

    const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const user = await prisma.user.update({ where: { id: userId }, data: { active } });

    await logAudit({
      userId: admin.id,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: user.id,
      summary: `${admin.name} ${active ? "reativou" : "inativou"} o usuário ${user.name}`,
      before: { ...before, passwordHash: undefined },
      after: { ...user, passwordHash: undefined },
    });

    revalidatePath("/usuarios");
    return {};
  } catch (err) {
    return { error: parseFormError(err) };
  }
}

const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export async function resetUserPassword(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requirePermission("users.manage");
    const data = resetPasswordSchema.parse(Object.fromEntries(formData));
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await logAudit({
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      summary: `${admin.name} redefiniu a senha de ${user.name}`,
    });

    return { success: "Senha redefinida com sucesso." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
