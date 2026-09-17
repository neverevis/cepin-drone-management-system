"use client";

import { ActionForm, type ActionState } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { EQUIPMENT_STATUSES } from "@/lib/enums";
import { EQUIPMENT_STATUS_LABELS } from "@/lib/constants";
import { toDateTimeLocalValue } from "@/lib/utils";

export interface EquipmentDefaults {
  name?: string;
  manufacturer?: string | null;
  model?: string | null;
  patrimonyNumber?: string | null;
  serialNumber?: string | null;
  unit?: string | null;
  sector?: string | null;
  acquisitionDate?: Date | string | null;
  status?: string;
  notes?: string | null;
}

export function EquipmentForm({
  action,
  defaults,
  submitLabel = "Salvar equipamento",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: EquipmentDefaults;
  submitLabel?: string;
}) {
  return (
    <ActionForm action={action} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">
                Nome do equipamento *
              </label>
              <input
                id="name"
                name="name"
                required
                className="input"
                defaultValue={defaults?.name}
                placeholder="Drone DJI Mavic 3 Multispectral"
              />
            </div>
            <div>
              <label className="label" htmlFor="manufacturer">
                Fabricante
              </label>
              <input
                id="manufacturer"
                name="manufacturer"
                className="input"
                defaultValue={defaults?.manufacturer ?? ""}
              />
            </div>
            <div>
              <label className="label" htmlFor="model">
                Modelo
              </label>
              <input id="model" name="model" className="input" defaultValue={defaults?.model ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="patrimonyNumber">
                Número de patrimônio
              </label>
              <input
                id="patrimonyNumber"
                name="patrimonyNumber"
                className="input"
                defaultValue={defaults?.patrimonyNumber ?? ""}
                placeholder="Deixe em branco se ainda não houver"
              />
            </div>
            <div>
              <label className="label" htmlFor="serialNumber">
                Número de série
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                className="input"
                defaultValue={defaults?.serialNumber ?? ""}
              />
            </div>
            <div>
              <label className="label" htmlFor="unit">
                Unidade de lotação
              </label>
              <input id="unit" name="unit" className="input" defaultValue={defaults?.unit ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="sector">
                Setor responsável
              </label>
              <input id="sector" name="sector" className="input" defaultValue={defaults?.sector ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="acquisitionDate">
                Data de aquisição
              </label>
              <input
                id="acquisitionDate"
                name="acquisitionDate"
                type="date"
                className="input"
                defaultValue={
                  defaults?.acquisitionDate
                    ? toDateTimeLocalValue(defaults.acquisitionDate).slice(0, 10)
                    : ""
                }
              />
            </div>
            <div>
              <label className="label" htmlFor="status">
                Situação *
              </label>
              <select id="status" name="status" required className="input" defaultValue={defaults?.status ?? "DISPONIVEL"}>
                {EQUIPMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {EQUIPMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Observações
              </label>
              <textarea id="notes" name="notes" rows={3} className="input" defaultValue={defaults?.notes ?? ""} />
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
