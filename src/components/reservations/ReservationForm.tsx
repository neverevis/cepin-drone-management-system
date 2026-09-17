"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { createReservation } from "@/lib/actions/reservations";

interface EquipmentOption {
  id: string;
  name: string;
}
interface ProjectOption {
  id: string;
  name: string;
}
interface BatteryOption {
  id: string;
  code: string;
  isPrimary: boolean;
}

export function ReservationForm({
  equipmentOptions,
  projectOptions,
  batteryOptions,
}: {
  equipmentOptions: EquipmentOption[];
  projectOptions: ProjectOption[];
  batteryOptions: BatteryOption[];
}) {
  return (
    <ActionForm action={createReservation} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Equipamento *</label>
              <select name="equipmentId" required className="input">
                <option value="">Selecione...</option>
                {equipmentOptions.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Projeto / atividade</label>
              <select name="projectId" className="input">
                <option value="">Nenhum</option>
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Finalidade *</label>
              <input name="purpose" required className="input" placeholder="Ex.: Mapeamento de talhão experimental" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Local de utilização</label>
              <input name="location" className="input" />
            </div>
            <div>
              <label className="label">Data/horário previstos de retirada *</label>
              <input name="scheduledPickupAt" type="datetime-local" required className="input" />
            </div>
            <div>
              <label className="label">Data/horário previstos de devolução *</label>
              <input name="scheduledReturnAt" type="datetime-local" required className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Baterias previstas</label>
              <div className="flex flex-wrap gap-3 rounded-md border border-gray-200 p-3">
                {batteryOptions.map((b) => (
                  <label key={b.id} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input type="checkbox" name="batteryIds" value={b.id} defaultChecked={b.isPrimary} />
                    {b.code}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observações</label>
              <textarea name="notes" rows={3} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Enviar solicitação</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
