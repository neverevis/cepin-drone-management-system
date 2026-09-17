"use client";

import { ActionForm, type ActionState } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { ROLES } from "@/lib/enums";
import { ROLE_LABELS } from "@/lib/constants";

export interface UserDefaults {
  name?: string;
  email?: string;
  role?: string;
  registration?: string | null;
  position?: string | null;
  sector?: string | null;
  phone?: string | null;
}

export function UserForm({
  action,
  defaults,
  mode,
  submitLabel = "Salvar",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: UserDefaults;
  mode: "create" | "edit";
  submitLabel?: string;
}) {
  return (
    <ActionForm action={action} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nome completo *</label>
              <input name="name" required className="input" defaultValue={defaults?.name} />
            </div>
            <div>
              <label className="label">E-mail institucional {mode === "create" ? "*" : ""}</label>
              <input
                name="email"
                type="email"
                required={mode === "create"}
                disabled={mode === "edit"}
                className="input disabled:bg-gray-100"
                defaultValue={defaults?.email}
              />
            </div>
            <div>
              <label className="label">Perfil de acesso *</label>
              <select name="role" required className="input" defaultValue={defaults?.role ?? "USUARIO_AUTORIZADO"}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Matrícula / SIAPE</label>
              <input name="registration" className="input" defaultValue={defaults?.registration ?? ""} />
            </div>
            <div>
              <label className="label">Cargo / função</label>
              <input name="position" className="input" defaultValue={defaults?.position ?? ""} />
            </div>
            <div>
              <label className="label">Setor</label>
              <input name="sector" className="input" defaultValue={defaults?.sector ?? "CEPIN"} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="phone" className="input" defaultValue={defaults?.phone ?? ""} />
            </div>
            {mode === "create" && (
              <div>
                <label className="label">Senha inicial *</label>
                <input name="password" type="password" required minLength={6} className="input" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>{submitLabel}</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
