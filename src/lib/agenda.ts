import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";

export type AgendaView = "mes" | "semana" | "lista";

export function parseAgendaDate(value?: string): Date {
  if (!value) return new Date();
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? new Date() : d;
}

export function monthGrid(ref: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(ref), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(ref), { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function weekGrid(ref: Date): Date[] {
  const gridStart = startOfWeek(ref, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(ref, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function agendaRange(view: AgendaView, ref: Date): { start: Date; end: Date } {
  if (view === "mes") {
    const days = monthGrid(ref);
    return { start: days[0], end: days[days.length - 1] };
  }
  if (view === "semana") {
    const days = weekGrid(ref);
    return { start: days[0], end: days[days.length - 1] };
  }
  return { start: ref, end: addMonths(ref, 3) };
}

export function navigate(view: AgendaView, ref: Date, direction: 1 | -1): Date {
  if (view === "semana") return direction === 1 ? addWeeks(ref, 1) : subWeeks(ref, 1);
  return direction === 1 ? addMonths(ref, 1) : subMonths(ref, 1);
}

export { isSameDay };
