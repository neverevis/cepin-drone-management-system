"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { updateSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import type { ActionState } from "@/components/ActionForm";

function parseFormError(err: unknown): string {
  if (err instanceof z.ZodError) return err.issues[0]?.message ?? "Dados inválidos.";
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado.";
}

const settingsSchema = z.object({
  institutionName: z.string().min(3),
  campusName: z.string().min(3),
  cepinName: z.string().min(1),
  cepinFullName: z.string().min(3),
  lowBatteryThresholdPercent: z.coerce.number().int().min(0).max(100),
  batteryCycleWarningLimit: z.coerce.number().int().min(0).max(1000),
  defaultSector: z.string().min(1),
  coordinatorName: z.string().optional(),
  coordinatorPosition: z.string().min(1),
});

export async function updateSystemSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requirePermission("settings.manage");
    const data = settingsSchema.parse(Object.fromEntries(formData));

    await updateSettings({ ...data, coordinatorName: data.coordinatorName || "" });

    await logAudit({
      userId: user.id,
      action: "UPDATE",
      entityType: "SystemSetting",
      summary: `${user.name} atualizou os parâmetros do sistema`,
      after: data,
    });

    revalidatePath("/configuracoes");
    return { success: "Configurações atualizadas com sucesso." };
  } catch (err) {
    return { error: parseFormError(err) };
  }
}
