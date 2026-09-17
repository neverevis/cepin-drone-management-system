"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { RETURN_CHECKLIST_ITEMS } from "@/lib/constants";
import { registerReturn } from "@/lib/actions/returns";

interface WithdrawalSummary {
  id: string;
  code: string;
  responsibleUserId: string;
  items: { battery: { id: string; code: string; currentChargePercent: number } | null }[];
}
interface UserOption {
  id: string;
  name: string;
}

export function ReturnForm({ withdrawal, userOptions }: { withdrawal: WithdrawalSummary; userOptions: UserOption[] }) {
  const [hasDamage, setHasDamage] = useState(false);
  const batteries = withdrawal.items.map((i) => i.battery).filter((b): b is NonNullable<typeof b> => !!b);

  return (
    <ActionForm action={registerReturn} initialState={{}} className="card space-y-5 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <input type="hidden" name="withdrawalId" value={withdrawal.id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Responsável pela devolução *</label>
              <select name="responsibleUserId" required className="input" defaultValue={withdrawal.responsibleUserId}>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Conferente *</label>
              <select name="checkedById" required className="input">
                <option value="">Selecione...</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="label mb-2">Checklist de devolução</h3>
            <div className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-2">
              {RETURN_CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name={`checklist_${item.key}`} defaultChecked className="mt-0.5" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {batteries.length > 0 && (
            <div>
              <h3 className="label mb-2">Carga das baterias na devolução</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {batteries.map((battery) => (
                  <div key={battery.id}>
                    <label className="label">{battery.code} (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      name={`battery_charge_${battery.id}`}
                      defaultValue={battery.currentChargePercent}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Condição física geral</label>
            <input name="physicalCondition" className="input" placeholder="Ex.: Bom estado, sem avarias visíveis" />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="hasDamage"
              type="checkbox"
              name="hasDamage"
              checked={hasDamage}
              onChange={(e) => setHasDamage(e.target.checked)}
            />
            <label htmlFor="hasDamage" className="text-sm text-gray-700">
              Foi identificada avaria, perda ou divergência
            </label>
          </div>

          {hasDamage && (
            <div>
              <label className="label">Descrição da avaria/divergência *</label>
              <textarea name="damageDescription" rows={2} required className="input" />
              <p className="mt-1 text-xs text-gray-400">
                Um registro de ocorrência poderá ser aberto separadamente para apuração administrativa.
              </p>
            </div>
          )}

          <div>
            <label className="label">Pendências</label>
            <textarea name="pendencies" rows={2} className="input" />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea name="notes" rows={2} className="input" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Confirmar devolução</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
