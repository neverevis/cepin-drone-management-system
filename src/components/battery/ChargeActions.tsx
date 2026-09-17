"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { startBatteryCharge, finishBatteryCharge, registerBatteryUsage } from "@/lib/actions/battery";

export function StartChargeForm({ batteryId, currentCharge }: { batteryId: string; currentCharge: number }) {
  const [open, setOpen] = useState(false);
  const action = startBatteryCharge.bind(null, batteryId);

  if (!open) {
    return (
      <button className="btn-secondary" onClick={() => setOpen(true)}>
        Iniciar carregamento
      </button>
    );
  }

  return (
    <ActionForm action={action} initialState={{}} className="space-y-3">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div>
            <label className="label">Carga no início do carregamento (%)</label>
            <input
              name="chargeBefore"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={currentCharge}
              className="input"
            />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea name="notes" rows={2} className="input" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <SubmitButton>Iniciar</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}

export function FinishChargeForm({
  batteryId,
  recordId,
  chargeBefore,
}: {
  batteryId: string;
  recordId: string;
  chargeBefore: number;
}) {
  const action = finishBatteryCharge.bind(null, batteryId, recordId);

  return (
    <ActionForm action={action} initialState={{}} className="mt-3 space-y-3 rounded-md border border-violet-200 bg-violet-50 p-3">
      {(state) => (
        <>
          <p className="text-xs text-violet-800">
            Carregamento em andamento desde {chargeBefore}% de carga. Informe o valor final para concluir.
          </p>
          <FormError message={state.error} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="label">Carga final (%)</label>
              <input name="chargeAfter" type="number" min={0} max={100} required defaultValue={100} className="input" />
            </div>
            <SubmitButton className="btn-primary">Concluir carregamento</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}

export function UsageForm({ batteryId, currentCharge }: { batteryId: string; currentCharge: number }) {
  const [open, setOpen] = useState(false);
  const action = registerBatteryUsage.bind(null, batteryId);

  if (!open) {
    return (
      <button className="btn-secondary" onClick={() => setOpen(true)}>
        Registrar uso manual
      </button>
    );
  }

  return (
    <ActionForm action={action} initialState={{}} className="space-y-3">
      {(state) => (
        <>
          <FormError message={state.error} />
          {state.success && (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Carga antes (%)</label>
              <input name="chargeBefore" type="number" min={0} max={100} required defaultValue={currentCharge} className="input" />
            </div>
            <div>
              <label className="label">Carga depois (%)</label>
              <input name="chargeAfter" type="number" min={0} max={100} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Ciclos informados pelo app DJI (opcional)</label>
            <input name="cyclesReported" type="number" min={0} className="input" />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea name="notes" rows={2} className="input" placeholder="Aquecimento, deformações, falhas, etc." />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <SubmitButton>Registrar</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
