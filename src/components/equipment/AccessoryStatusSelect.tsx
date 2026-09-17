"use client";

import { useTransition } from "react";
import { ACCESSORY_STATUSES } from "@/lib/enums";
import { ACCESSORY_STATUS_LABELS } from "@/lib/constants";
import { updateAccessoryStatus } from "@/lib/actions/equipment";

export function AccessoryStatusSelect({
  accessoryId,
  status,
}: {
  accessoryId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="input py-1 text-xs"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          updateAccessoryStatus(accessoryId, value);
        });
      }}
    >
      {ACCESSORY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ACCESSORY_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
