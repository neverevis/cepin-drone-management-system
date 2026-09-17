"use client";

import { useTransition, useState } from "react";
import { cancelReservation } from "@/lib/actions/reservations";

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        className="btn-danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("Cancelar esta solicitação?")) return;
          startTransition(async () => {
            const result = await cancelReservation(reservationId);
            if (result.error) setError(result.error);
          });
        }}
      >
        {pending ? "Cancelando..." : "Cancelar solicitação"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
