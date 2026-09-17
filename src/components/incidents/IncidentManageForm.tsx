"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { INCIDENT_STATUSES } from "@/lib/enums";
import { INCIDENT_STATUS_LABELS } from "@/lib/constants";
import { updateIncident } from "@/lib/actions/incidents";

export function IncidentManageForm({
  incidentId,
  status,
  providences,
  blocksEquipment,
  hasLinkedItem,
}: {
  incidentId: string;
  status: string;
  providences: string | null;
  blocksEquipment: boolean;
  hasLinkedItem: boolean;
}) {
  const action = updateIncident.bind(null, incidentId);

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-3 p-4">
      {(state) => (
        <>
          <h3 className="text-sm font-semibold text-gray-900">Providências e status</h3>
          <FormError message={state.error} />
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" defaultValue={status}>
              {INCIDENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {INCIDENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Providências tomadas</label>
            <textarea name="providences" rows={3} className="input" defaultValue={providences ?? ""} />
          </div>
          {hasLinkedItem && (
            <div className="flex items-center gap-2">
              <input id="blocksEquipment" type="checkbox" name="blocksEquipment" defaultChecked={blocksEquipment} />
              <label htmlFor="blocksEquipment" className="text-sm text-gray-700">
                Bloquear disponibilidade do item até liberação
              </label>
            </div>
          )}
          <SubmitButton>Salvar</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
