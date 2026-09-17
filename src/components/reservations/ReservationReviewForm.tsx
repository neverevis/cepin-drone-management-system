"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { reviewReservation } from "@/lib/actions/reservations";

export function ReservationReviewForm({ reservationId }: { reservationId: string }) {
  const action = reviewReservation.bind(null, reservationId);

  return (
    <ActionForm action={action} initialState={{}} className="card space-y-3 p-4">
      {(state) => (
        <>
          <h3 className="text-sm font-semibold text-gray-900">Análise da solicitação</h3>
          <FormError message={state.error} />
          <div>
            <label className="label">Parecer / observações</label>
            <textarea name="reviewNotes" rows={2} className="input" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SubmitButton className="btn-primary" name="decision" value="APROVADA">
              Aprovar
            </SubmitButton>
            <SubmitButton className="btn-danger" name="decision" value="REJEITADA">
              Rejeitar
            </SubmitButton>
            <SubmitButton className="btn-secondary" name="decision" value="EM_ANALISE">
              Marcar como em análise
            </SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
