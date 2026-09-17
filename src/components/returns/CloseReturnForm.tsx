"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { closeReturn } from "@/lib/actions/returns";

export function CloseReturnForm({ returnId }: { returnId: string }) {
  const action = closeReturn.bind(null, returnId);

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-3 p-4">
      {(state) => (
        <>
          <h3 className="text-sm font-semibold text-gray-900">Encerrar devolução</h3>
          <FormError message={state.error} />
          <div>
            <label className="label">Providências / justificativa</label>
            <textarea name="closedNotes" rows={2} className="input" placeholder="Necessário se houver avaria registrada" />
          </div>
          <SubmitButton>Encerrar</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
