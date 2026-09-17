import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { CloseReturnForm } from "@/components/returns/CloseReturnForm";
import { formatDateTime } from "@/lib/utils";

export default async function ReturnDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const ret = await prisma.return.findUnique({
    where: { id: params.id },
    include: {
      withdrawal: { include: { equipment: true } },
      responsibleUser: true,
      checkedBy: true,
      items: { include: { equipment: true, accessory: true, battery: true } },
    },
  });

  if (!ret || !user) notFound();

  const canClose = can(user.role, "returns.close") && !ret.closedAt;

  return (
    <div>
      <PageHeader
        title={`Devolução — ${ret.withdrawal.code}`}
        actions={
          <a href={`/api/devolucoes/${ret.id}/comprovante`} target="_blank" rel="noreferrer" className="btn-secondary">
            Gerar comprovante (PDF)
          </a>
        }
      />

      <div className="mb-4 flex gap-2">
        {ret.hasDamage && <Badge label="Avaria registrada" colorClass="bg-red-100 text-red-800 border-red-300" />}
        <Badge
          label={ret.closedAt ? "Encerrada" : "Com pendências / aguardando encerramento"}
          colorClass={ret.closedAt ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-2">
          <Row label="Devolvido em" value={formatDateTime(ret.returnedAt)} />
          <Row label="Responsável pela devolução" value={ret.responsibleUser.name} />
          <Row label="Conferente" value={ret.checkedBy.name} />
          <Row label="Condição física" value={ret.physicalCondition} />
          {ret.hasDamage && <Row label="Descrição da avaria" value={ret.damageDescription} />}
          <Row label="Pendências" value={ret.pendencies} />
          <Row label="Observações" value={ret.notes} />
          {ret.closedAt && <Row label="Encerrada em" value={formatDateTime(ret.closedAt)} />}
          {ret.closedNotes && <Row label="Providências finais" value={ret.closedNotes} />}
        </div>

        {canClose && (
          <div>
            <CloseReturnForm returnId={ret.id} />
          </div>
        )}

        <div className="card p-4 lg:col-span-3">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Itens conferidos na devolução</h2>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Presente</th>
                  <th>Carga na devolução</th>
                </tr>
              </thead>
              <tbody>
                {ret.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.equipment?.name ?? item.accessory?.name ?? item.battery?.code}</td>
                    <td>{item.present ? "Sim" : "Não"}</td>
                    <td>{item.chargePercentIn !== null ? `${item.chargePercentIn}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {ret.hasDamage && (
          <div className="card p-4 lg:col-span-3">
            <p className="text-sm text-gray-600">
              Uma avaria foi identificada na devolução. Registre uma ocorrência para apuração administrativa, se ainda não
              tiver sido registrada.
            </p>
            <Link href={`/ocorrencias/nova?equipmentId=${ret.withdrawal.equipment.id}`} className="btn-secondary mt-2 inline-block">
              Registrar ocorrência
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-50 pb-2 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800 sm:text-right">{value}</dd>
    </div>
  );
}
