"use client";

import { useFormState } from "react-dom";
import type { ReactNode } from "react";

export interface ActionState {
  error?: string;
  success?: string;
}

export function ActionForm({
  action,
  initialState,
  children,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialState: ActionState;
  children: (state: ActionState) => ReactNode;
  className?: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, initialState);
  return (
    <form action={formAction} className={className}>
      {children(state)}
    </form>
  );
}
