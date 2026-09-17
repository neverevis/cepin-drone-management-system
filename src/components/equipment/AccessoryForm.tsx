"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { ACCESSORY_TYPES, ACCESSORY_STATUSES } from "@/lib/enums";
import { ACCESSORY_TYPE_LABELS, ACCESSORY_STATUS_LABELS } from "@/lib/constants";
import { createAccessory } from "@/lib/actions/equipment";

export function AccessoryForm({ equipmentId }: { equipmentId: string }) {
  const [open, setOpen] = useState(false);
  const action = createAccessory.bind(null, equipmentId);

  if (!open) {
    return (
      <button className="btn-secondary" onClick={() => setOpen(true)}>
        Adicionar acessório
      </button>
    );
  }

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-3 p-4">
      {(state) => (
        <>
          <FormError message={state.error} />
          {state.success && (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
              {state.success}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tipo *</label>
              <select name="type" required className="input">
                {ACCESSORY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ACCESSORY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nome *</label>
              <input name="name" required className="input" />
            </div>
            <div>
              <label className="label">Identificador interno</label>
              <input name="identifier" className="input" placeholder="Ex.: ACC-001" />
            </div>
            <div>
              <label className="label">Número de série</label>
              <input name="serialNumber" className="input" />
            </div>
            <div>
              <label className="label">Situação *</label>
              <select name="status" required className="input" defaultValue="DISPONIVEL">
                {ACCESSORY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ACCESSORY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Condição</label>
              <input name="condition" className="input" placeholder="Ex.: Bom estado" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea name="notes" rows={2} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <SubmitButton>Salvar acessório</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
