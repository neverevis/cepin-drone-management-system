"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { MAINTENANCE_STATUSES } from "@/lib/enums";
import { MAINTENANCE_STATUS_LABELS } from "@/lib/constants";
import { updateMaintenance } from "@/lib/actions/maintenance";

export function MaintenanceManageForm({
  maintenanceId,
  status,
  description,
  cost,
}: {
  maintenanceId: string;
  status: string;
  description: string;
  cost: number | null;
}) {
  const action = updateMaintenance.bind(null, maintenanceId);

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-3 p-4">
      {(state) => (
        <>
          <h3 className="text-sm font-semibold text-gray-900">Atualizar manutenção</h3>
          <FormError message={state.error} />
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue={status}>
              {MAINTENANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {MAINTENANCE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" rows={3} required className="input" defaultValue={description} />
          </div>
          <div>
            <label className="label">Custo (R$)</label>
            <input name="cost" type="number" step="0.01" min={0} className="input" defaultValue={cost ?? ""} />
          </div>
          <SubmitButton>Salvar</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
