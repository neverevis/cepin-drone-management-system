"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { FLIGHT_ACTIVITY_TYPES } from "@/lib/enums";
import { FLIGHT_ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { createFlightLog } from "@/lib/actions/flightlogs";

interface ProjectOption {
  id: string;
  name: string;
}
interface BatteryOption {
  id: string;
  code: string;
  currentChargePercent: number;
}

export function FlightLogForm({
  withdrawalId,
  projectOptions,
  batteryOptions,
}: {
  withdrawalId: string;
  projectOptions: ProjectOption[];
  batteryOptions: BatteryOption[];
}) {
  const action = createFlightLog.bind(null, withdrawalId);

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Data *</label>
              <input name="date" type="date" required className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label className="label">Horário de início *</label>
              <input name="startTime" type="time" required className="input" />
            </div>
            <div>
              <label className="label">Horário de término *</label>
              <input name="endTime" type="time" required className="input" />
            </div>
            <div>
              <label className="label">Tipo de atividade *</label>
              <select name="activityType" required className="input" defaultValue="OUTRO">
                {FLIGHT_ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {FLIGHT_ACTIVITY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Projeto</label>
              <select name="projectId" className="input">
                <option value="">Nenhum</option>
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Local</label>
              <input name="location" className="input" />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Finalidade</label>
              <input name="purpose" className="input" />
            </div>
          </div>

          {batteryOptions.length > 0 && (
            <div>
              <h3 className="label mb-2">Baterias utilizadas nesta atividade</h3>
              <p className="mb-2 text-xs text-gray-400">
                Preencha apenas as baterias efetivamente usadas neste voo. Os horários informados são
                registros manuais (não há integração de telemetria).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {batteryOptions.map((b) => (
                  <div key={b.id} className="rounded-md border border-gray-200 p-3">
                    <p className="mb-1 text-sm font-medium text-gray-700">{b.code}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Carga antes (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          name={`battery_before_${b.id}`}
                          defaultValue={b.currentChargePercent}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Carga depois (%)</label>
                        <input type="number" min={0} max={100} name={`battery_after_${b.id}`} className="input" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Ocorrências durante a atividade</label>
            <textarea name="occurrences" rows={2} className="input" />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea name="notes" rows={2} className="input" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Registrar utilização</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
