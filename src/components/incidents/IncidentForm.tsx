"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { TargetSelect } from "@/components/TargetSelect";
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from "@/lib/enums";
import { INCIDENT_TYPE_LABELS, INCIDENT_SEVERITY_LABELS } from "@/lib/constants";
import { createIncident } from "@/lib/actions/incidents";
import type { TargetOption } from "@/lib/targetOptions";

export function IncidentForm({ options, defaultTarget }: { options: TargetOption[]; defaultTarget?: string }) {
  return (
    <ActionForm action={createIncident} initialState={{}} className="card space-y-4 p-6">
      {(state) => (
        <>
          <FormError message={state.error} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Item afetado *</label>
              <TargetSelect options={options} defaultValue={defaultTarget} />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select name="type" required className="input">
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INCIDENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gravidade *</label>
              <select name="severity" required className="input" defaultValue="MEDIA">
                {INCIDENT_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {INCIDENT_SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrição *</label>
              <textarea name="description" rows={4} required className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SubmitButton>Registrar ocorrência</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
