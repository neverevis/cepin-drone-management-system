import { prisma } from "./prisma";

export interface TargetOption {
  value: string; // "equipment:ID" | "accessory:ID" | "battery:ID"
  label: string;
  group: "Equipamentos" | "Acessórios" | "Baterias";
}

export async function getTargetOptions(): Promise<TargetOption[]> {
  const [equipmentList, accessories, batteries] = await Promise.all([
    prisma.equipment.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.accessory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.battery.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true } }),
  ]);

  return [
    ...equipmentList.map((e) => ({ value: `equipment:${e.id}`, label: e.name, group: "Equipamentos" as const })),
    ...accessories.map((a) => ({ value: `accessory:${a.id}`, label: a.name, group: "Acessórios" as const })),
    ...batteries.map((b) => ({ value: `battery:${b.id}`, label: b.code, group: "Baterias" as const })),
  ];
}
