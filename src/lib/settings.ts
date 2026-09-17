import { prisma } from "./prisma";

export interface SystemSettings {
  institutionName: string;
  campusName: string;
  cepinName: string;
  cepinFullName: string;
  lowBatteryThresholdPercent: number;
  batteryCycleWarningLimit: number;
  defaultSector: string;
  coordinatorName: string;
  coordinatorPosition: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  institutionName: "Instituto Federal de Educação, Ciência e Tecnologia de São Paulo",
  campusName: "IFSP - Câmpus Araraquara",
  cepinName: "CEPIN",
  cepinFullName:
    "Centro de Pesquisa e Inovação em Inteligência Artificial e Robótica Agrícola",
  lowBatteryThresholdPercent: 30,
  batteryCycleWarningLimit: 180, // aviso antes do limite de 200 ciclos recomendado pela DJI
  defaultSector: "CEPIN",
  coordinatorName: "",
  coordinatorPosition: "Coordenador(a) do CEPIN",
};

const NUMERIC_KEYS: (keyof SystemSettings)[] = [
  "lowBatteryThresholdPercent",
  "batteryCycleWarningLimit",
];

export async function getSettings(): Promise<SystemSettings> {
  const rows = await prisma.systemSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SystemSettings)[]) {
    const raw = map.get(key);
    if (raw === undefined) continue;
    if (NUMERIC_KEYS.includes(key)) {
      (result[key] as number) = Number(raw);
    } else {
      (result[key] as string) = raw;
    }
  }
  return result;
}

export async function updateSettings(partial: Partial<SystemSettings>) {
  const entries = Object.entries(partial) as [keyof SystemSettings, string | number][];
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
}
