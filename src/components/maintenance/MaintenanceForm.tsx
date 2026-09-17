"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { TargetSelect } from "@/components/TargetSelect";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "@/lib/enums";
import { MAINTENANCE_TYPE_LABELS, MAINTENANCE_STATUS_LABELS } from "@/lib/constants";
import { createMaintenance } from "@/lib/actions/maintenance";
import type { TargetOption } from "@/lib/targetOptions";

interface UserOption {
  id: string;
  name: string;
}

export function MaintenanceForm({ options, userOptions }: { options: TargetOption[]; userOptions: UserOption[] }) {
  return (
    <ActionForm action={createMaintenance} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Item *</label>
              <TargetSelect options={options} />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select name="type" required className="input">
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MAINTENANCE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select name="status" required className="input" defaultValue="AGENDADA">
                {MAINTENANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {MAINTENANCE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data agendada</label>
              <input name="scheduledDate" type="date" className="input" />
            </div>
            <div>
              <label className="label">Responsável</label>
              <select name="responsibleId" className="input">
                <option value="">Não definido</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Prestador externo (se houver)</label>
              <input name="externalProvider" className="input" />
            </div>
            <div>
              <label className="label">Custo estimado (R$)</label>
              <input name="cost" type="number" step="0.01" min={0} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrição *</label>
              <textarea name="description" rows={3} required className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Registrar manutenção</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
