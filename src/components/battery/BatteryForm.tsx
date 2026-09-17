"use client";

import { ActionForm, type ActionState } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { BATTERY_STATUSES } from "@/lib/enums";
import { BATTERY_STATUS_LABELS } from "@/lib/constants";
import { toDateTimeLocalValue } from "@/lib/utils";

export interface BatteryDefaults {
  code?: string;
  isPrimary?: boolean;
  serialNumber?: string | null;
  model?: string | null;
  nominalCapacityMah?: number | null;
  acquisitionDate?: Date | string | null;
  status?: string;
  currentChargePercent?: number;
  cycleCount?: number | null;
  notes?: string | null;
}

export function BatteryForm({
  action,
  defaults,
  submitLabel = "Salvar bateria",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: BatteryDefaults;
  submitLabel?: string;
}) {
  return (
    <ActionForm action={action} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Código *</label>
              <input name="code" required className="input" defaultValue={defaults?.code} placeholder="BAT-1" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="isPrimary" name="isPrimary" type="checkbox" defaultChecked={defaults?.isPrimary} />
              <label htmlFor="isPrimary" className="text-sm text-gray-700">
                Bateria principal
              </label>
            </div>
            <div>
              <label className="label">Modelo</label>
              <input name="model" className="input" defaultValue={defaults?.model ?? ""} />
            </div>
            <div>
              <label className="label">Número de série</label>
              <input name="serialNumber" className="input" defaultValue={defaults?.serialNumber ?? ""} />
            </div>
            <div>
              <label className="label">Capacidade nominal (mAh)</label>
              <input
                name="nominalCapacityMah"
                type="number"
                className="input"
                defaultValue={defaults?.nominalCapacityMah ?? ""}
              />
            </div>
            <div>
              <label className="label">Data de aquisição</label>
              <input
                name="acquisitionDate"
                type="date"
                className="input"
                defaultValue={
                  defaults?.acquisitionDate ? toDateTimeLocalValue(defaults.acquisitionDate).slice(0, 10) : ""
                }
              />
            </div>
            <div>
              <label className="label">Situação *</label>
              <select name="status" required className="input" defaultValue={defaults?.status ?? "DISPONIVEL"}>
                {BATTERY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {BATTERY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Carga atual (%) *</label>
              <input
                name="currentChargePercent"
                type="number"
                min={0}
                max={100}
                required
                className="input"
                defaultValue={defaults?.currentChargePercent ?? 100}
              />
            </div>
            <div>
              <label className="label">Ciclos de carga informados</label>
              <input
                name="cycleCount"
                type="number"
                min={0}
                className="input"
                defaultValue={defaults?.cycleCount ?? 0}
              />
              <p className="mt-1 text-xs text-gray-400">
                Informe manualmente conforme exibido no aplicativo DJI. O sistema nunca estima este valor.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea name="notes" rows={3} className="input" defaultValue={defaults?.notes ?? ""} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>{submitLabel}</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
