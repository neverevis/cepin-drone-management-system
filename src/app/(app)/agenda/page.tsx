import Link from "next/link";
import { format, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, cn } from "@/lib/utils";
import { agendaRange, monthGrid, weekGrid, navigate, parseAgendaDate, type AgendaView } from "@/lib/agenda";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const view: AgendaView = searchParams.view === "semana" || searchParams.view === "lista" ? searchParams.view : "mes";
  const ref = parseAgendaDate(searchParams.date);
  const { start, end } = agendaRange(view, ref);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: { notIn: ["RASCUNHO", "CANCELADA", "REJEITADA"] },
      scheduledPickupAt: { lte: end },
      scheduledReturnAt: { gte: start },
    },
    orderBy: { scheduledPickupAt: "asc" },
    include: { requester: true, equipment: true },
  });

  const prevDate = format(navigate(view, ref, -1), "yyyy-MM-dd");
  const nextDate = format(navigate(view, ref, 1), "yyyy-MM-dd");

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Visualização das reservas e retiradas do equipamento."
        actions={
          <div className="flex gap-2">
            {(["mes", "semana", "lista"] as AgendaView[]).map((v) => (
              <Link
                key={v}
                href={`/agenda?view=${v}&date=${format(ref, "yyyy-MM-dd")}`}
                className={cn("btn-secondary", view === v && "bg-cepin-600 text-white border-cepin-600 hover:bg-cepin-700")}
              >
                {v === "mes" ? "Mês" : v === "semana" ? "Semana" : "Lista"}
              </Link>
            ))}
          </div>
        }
      />

      {view !== "lista" && (
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/agenda?view=${view}&date=${prevDate}`} className="btn-secondary">
            ← Anterior
          </Link>
          <p className="text-sm font-medium text-gray-700">
            {view === "mes" ? format(ref, "MMMM yyyy", { locale: ptBR }) : `Semana de ${format(weekGrid(ref)[0], "dd/MM")}`}
          </p>
          <Link href={`/agenda?view=${view}&date=${nextDate}`} className="btn-secondary">
            Próxima →
          </Link>
        </div>
      )}

      {view === "lista" && (
        <ListView reservations={reservations} />
      )}

      {view === "mes" && <MonthView refDate={ref} reservations={reservations} />}

      {view === "semana" && <WeekView refDate={ref} reservations={reservations} />}
    </div>
  );
}

type ReservationRow = Awaited<ReturnType<typeof prisma.reservation.findMany>>[number] & {
  requester: { name: string };
  equipment: { name: string };
};

function ListView({ reservations }: { reservations: ReservationRow[] }) {
  if (reservations.length === 0) {
    return <p className="card p-6 text-sm text-gray-500">Nenhuma solicitação nos próximos meses.</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Código</th>
            <th>Equipamento</th>
            <th>Solicitante</th>
            <th>Retirada</th>
            <th>Devolução</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>
                <Link href={`/solicitacoes/${r.id}`} className="font-medium text-cepin-700 hover:underline">
                  {r.code}
                </Link>
              </td>
              <td>{r.equipment.name}</td>
              <td>{r.requester.name}</td>
              <td>{formatDateTime(r.scheduledPickupAt)}</td>
              <td>{formatDateTime(r.scheduledReturnAt)}</td>
              <td>
                <Badge label={RESERVATION_STATUS_LABELS[r.status] ?? r.status} colorClass={RESERVATION_STATUS_COLORS[r.status]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DayCell({ day, reservations, faded }: { day: Date; reservations: ReservationRow[]; faded?: boolean }) {
  const dayReservations = reservations.filter(
    (r) => day >= new Date(r.scheduledPickupAt.toDateString()) && day <= new Date(r.scheduledReturnAt.toDateString())
  );
  return (
    <div className={cn("min-h-[92px] border border-gray-100 p-1.5", faded && "bg-gray-50")}>
      <p className={cn("mb-1 text-xs font-medium", faded ? "text-gray-400" : "text-gray-600")}>{format(day, "d")}</p>
      <div className="space-y-1">
        {dayReservations.slice(0, 3).map((r) => (
          <Link
            key={r.id}
            href={`/solicitacoes/${r.id}`}
            title={`${r.code} · ${r.requester.name}`}
            className={cn("block truncate rounded px-1 py-0.5 text-[11px] font-medium", RESERVATION_STATUS_COLORS[r.status])}
          >
            {r.code}
          </Link>
        ))}
        {dayReservations.length > 3 && <p className="text-[10px] text-gray-400">+{dayReservations.length - 3} mais</p>}
      </div>
    </div>
  );
}

function MonthView({ refDate, reservations }: { refDate: Date; reservations: ReservationRow[] }) {
  const days = monthGrid(refDate);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-500">
        {weekDays.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <DayCell key={day.toISOString()} day={day} reservations={reservations} faded={!isSameMonth(day, refDate)} />
        ))}
      </div>
    </div>
  );
}

function WeekView({ refDate, reservations }: { refDate: Date; reservations: ReservationRow[] }) {
  const days = weekGrid(refDate);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const dayReservations = reservations.filter(
          (r) => day >= new Date(r.scheduledPickupAt.toDateString()) && day <= new Date(r.scheduledReturnAt.toDateString())
        );
        return (
          <div key={day.toISOString()} className="card p-2">
            <p className="mb-2 text-xs font-semibold text-gray-600">{format(day, "EEE dd/MM", { locale: ptBR })}</p>
            <div className="space-y-1">
              {dayReservations.length === 0 && <p className="text-xs text-gray-300">-</p>}
              {dayReservations.map((r) => (
                <Link
                  key={r.id}
                  href={`/solicitacoes/${r.id}`}
                  className={cn("block rounded px-1.5 py-1 text-[11px] font-medium", RESERVATION_STATUS_COLORS[r.status])}
                >
                  {r.code} · {r.requester.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
