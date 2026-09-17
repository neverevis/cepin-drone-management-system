"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { updateSystemSettings } from "@/lib/actions/settings";
import type { SystemSettings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: SystemSettings }) {
  return (
    <ActionForm action={updateSystemSettings} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          {state.success && (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Instituição</label>
              <input name="institutionName" required className="input" defaultValue={settings.institutionName} />
            </div>
            <div>
              <label className="label">Câmpus</label>
              <input name="campusName" required className="input" defaultValue={settings.campusName} />
            </div>
            <div>
              <label className="label">Sigla do centro</label>
              <input name="cepinName" required className="input" defaultValue={settings.cepinName} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Nome completo do centro</label>
              <input name="cepinFullName" required className="input" defaultValue={settings.cepinFullName} />
            </div>
            <div>
              <label className="label">Setor padrão</label>
              <input name="defaultSector" required className="input" defaultValue={settings.defaultSector} />
            </div>
            <div>
              <label className="label">Limiar de carga baixa da bateria (%)</label>
              <input
                name="lowBatteryThresholdPercent"
                type="number"
                min={0}
                max={100}
                required
                className="input"
                defaultValue={settings.lowBatteryThresholdPercent}
              />
            </div>
            <div>
              <label className="label">Aviso de ciclos de bateria (a partir de)</label>
              <input
                name="batteryCycleWarningLimit"
                type="number"
                min={0}
                required
                className="input"
                defaultValue={settings.batteryCycleWarningLimit}
              />
              <p className="mt-1 text-xs text-gray-400">A DJI recomenda substituição a partir de 200 ciclos.</p>
            </div>
            <div>
              <label className="label">Nome do(a) coordenador(a)</label>
              <input name="coordinatorName" className="input" defaultValue={settings.coordinatorName} />
            </div>
            <div>
              <label className="label">Cargo do(a) coordenador(a)</label>
              <input name="coordinatorPosition" required className="input" defaultValue={settings.coordinatorPosition} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Estes dados são usados nos cabeçalhos e assinaturas dos documentos (Termo de Retirada e Comprovante de
            Devolução) gerados pelo sistema.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Salvar configurações</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
