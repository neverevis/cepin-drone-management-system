"use client";

import { useState, useTransition } from "react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { toggleUserActive, resetUserPassword } from "@/lib/actions/users";

export function ToggleActiveButton({ userId, active }: { userId: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={active ? "text-xs font-medium text-red-600 hover:underline" : "text-xs font-medium text-green-600 hover:underline"}
      disabled={pending}
      onClick={() => {
        if (active && !confirm("Inativar este usuário? Ele não conseguirá mais acessar o sistema.")) return;
        startTransition(() => {
          toggleUserActive(userId, !active);
        });
      }}
    >
      {active ? "Inativar" : "Reativar"}
    </button>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const action = resetUserPassword.bind(null, userId);

  if (!open) {
    return (
      <button className="text-xs font-medium text-cepin-700 hover:underline" onClick={() => setOpen(true)}>
        Redefinir senha
      </button>
    );
  }

  return (
    <ActionForm action={action} initialState={{}} className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
      {(state) => (
        <>
          <FormError message={state.error} />
          {state.success && <p className="text-xs text-green-700">{state.success}</p>}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="label">Nova senha</label>
              <input name="password" type="password" minLength={6} required className="input" />
            </div>
            <SubmitButton className="btn-secondary">Definir</SubmitButton>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
        </>
      )}
    </ActionForm>
  );
}
