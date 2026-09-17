// Conjuntos de valores válidos para os campos armazenados como String no SQLite.
// Mantidos centralizados para uso em validação (zod), formulários e labels.

export const ROLES = ["ADMIN", "TECNICO", "PILOTO"] as const;
export type Role = (typeof ROLES)[number];

export const EQUIPMENT_TYPES = [
  "AERONAVE",
  "BATERIA",
  "CONTROLE_REMOTO",
  "HELICES",
  "MODULO_RTK",
  "FILTRO_ND",
  "CARREGADOR",
  "CARTAO_MEMORIA",
  "CABO",
  "CASE_MALETA",
  "OUTRO",
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_STATUSES = [
  "DISPONIVEL",
  "EM_USO",
  "EM_MANUTENCAO",
  "INATIVO",
] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const LOAN_STATUSES = ["ABERTA", "DEVOLVIDA", "CANCELADA"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const FLIGHT_TYPES = [
  "MAPEAMENTO_2D",
  "MODELO_3D",
  "INSPECAO",
  "TREINAMENTO",
  "PESQUISA",
  "OUTRO",
] as const;
export type FlightType = (typeof FLIGHT_TYPES)[number];

export const MAINTENANCE_TYPES = [
  "PREVENTIVA",
  "CORRETIVA",
  "CALIBRACAO",
  "ATUALIZACAO_FIRMWARE",
  "LIMPEZA",
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_STATUSES = [
  "AGENDADA",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "CANCELADA",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];
