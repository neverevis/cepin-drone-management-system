"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { PICKUP_CHECKLIST_ITEMS } from "@/lib/constants";
import { registerWithdrawal } from "@/lib/actions/withdrawals";
import { formatDateTime } from "@/lib/utils";

interface ReservationSummary {
  id: string;
  code: string;
  purpose: string;
  location: string | null;
  scheduledPickupAt: Date;
  scheduledReturnAt: Date;
  requester: { id: string; name: string; registration: string | null; position: string | null; sector: string | null };
  batteries: { battery: { id: string; code: string; currentChargePercent: number } }[];
}

interface UserOption {
  id: string;
  name: string;
}

export function WithdrawalForm({
  reservation,
  userOptions,
}: {
  reservation: ReservationSummary;
  userOptions: UserOption[];
}) {
  return (
    <ActionForm action={registerWithdrawal} initialState={{}} className="card space-y-5 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <input type="hidden" name="reservationId" value={reservation.id} />

          <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            <p>
              <strong>{reservation.code}</strong> · {reservation.purpose}
            </p>
            <p>
              Previsto: {formatDateTime(reservation.scheduledPickupAt)} até {formatDateTime(reservation.scheduledReturnAt)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Responsável pela retirada *</label>
              <select name="responsibleUserId" required className="input" defaultValue={reservation.requester.id}>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Matrícula do responsável</label>
              <input name="responsibleRegistration" className="input" defaultValue={reservation.requester.registration ?? ""} />
            </div>
            <div>
              <label className="label">Cargo / função</label>
              <input name="responsiblePosition" className="input" defaultValue={reservation.requester.position ?? ""} />
            </div>
            <div>
              <label className="label">Setor</label>
              <input name="responsibleSector" className="input" defaultValue={reservation.requester.sector ?? ""} />
            </div>
            <div>
              <label className="label">Nº do processo SUAP</label>
              <input name="suapProcessNumber" className="input" placeholder="23000.xxxxxx/2024-xx" />
            </div>
            <div>
              <label className="label">Nº do documento SUAP</label>
              <input name="suapDocumentNumber" className="input" placeholder="Opcional" />
            </div>
          </div>

          <div>
            <h3 className="label mb-2">Checklist de entrega</h3>
            <div className="grid grid-cols-1 gap-2 rounded-md border border-gray-200 p-3 sm:grid-cols-2">
              {PICKUP_CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name={`checklist_${item.key}`} defaultChecked className="mt-0.5" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {reservation.batteries.length > 0 && (
            <div>
              <h3 className="label mb-2">Carga das baterias no momento da entrega</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {reservation.batteries.map(({ battery }) => (
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
            <label className="label">Observações da entrega</label>
            <textarea name="pickupNotes" rows={3} className="input" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Confirmar retirada</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
