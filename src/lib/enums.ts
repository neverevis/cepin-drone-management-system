// Conjuntos de valores válidos para os campos armazenados como String no SQLite
// (o SQLite não possui enum nativo). Centralizados para uso em validação (zod),
// formulários, labels e na matriz de permissões.

export const ROLES = [
  "ADMIN",
  "RESPONSAVEL_CEPIN",
  "USUARIO_AUTORIZADO",
  "OPERADOR_CONFERENTE",
] as const;
export type Role = (typeof ROLES)[number];

export const EQUIPMENT_STATUSES = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_USO",
  "EM_MANUTENCAO",
  "INDISPONIVEL",
  "BAIXADO",
] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const ACCESSORY_TYPES = [
  "CONTROLE_REMOTO",
  "HELICES",
  "CABO",
  "MALETA",
  "MODULO_RTK",
  "FILTRO_ND",
  "CARREGADOR",
  "OUTRO",
] as const;
export type AccessoryType = (typeof ACCESSORY_TYPES)[number];

export const ACCESSORY_STATUSES = [
  "DISPONIVEL",
  "EM_USO",
  "EM_MANUTENCAO",
  "INDISPONIVEL",
] as const;
export type AccessoryStatus = (typeof ACCESSORY_STATUSES)[number];

export const BATTERY_STATUSES = [
  "DISPONIVEL",
  "EM_USO",
  "CARREGANDO",
  "EM_MANUTENCAO",
  "INDISPONIVEL",
] as const;
export type BatteryStatus = (typeof BATTERY_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "RASCUNHO",
  "SOLICITADA",
  "EM_ANALISE",
  "APROVADA",
  "REJEITADA",
  "RETIRADA",
  "EM_USO",
  "DEVOLVIDA",
  "CANCELADA",
  "ENCERRADA",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// Status que "ocupam" a agenda do equipamento (usados na checagem de conflito)
export const RESERVATION_ACTIVE_STATUSES: ReservationStatus[] = [
  "SOLICITADA",
  "EM_ANALISE",
  "APROVADA",
  "RETIRADA",
  "EM_USO",
];

export const WITHDRAWAL_STATUSES = ["ABERTA", "DEVOLVIDA", "CANCELADA"] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

export const FLIGHT_ACTIVITY_TYPES = [
  "MAPEAMENTO",
  "AGRICULTURA_PRECISAO",
  "PESQUISA",
  "AULA",
  "TREINAMENTO",
  "INSPECAO",
  "OUTRO",
] as const;
export type FlightActivityType = (typeof FLIGHT_ACTIVITY_TYPES)[number];

export const INCIDENT_TYPES = [
  "AVARIA",
  "FALHA_FUNCIONAMENTO",
  "PROBLEMA_BATERIA",
  "PERDA_EXTRAVIO",
  "FURTO",
  "ACIDENTE",
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_SEVERITIES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUSES = [
  "ABERTA",
  "EM_ANALISE",
  "EM_PROVIDENCIA",
  "RESOLVIDA",
  "ENCERRADA",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const MAINTENANCE_TYPES = [
  "PREVENTIVA",
  "CORRETIVA",
  "CALIBRACAO",
  "ATUALIZACAO_FIRMWARE",
  "LIMPEZA",
  "INSPECAO",
] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];

export const MAINTENANCE_STATUSES = [
  "AGENDADA",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "CANCELADA",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const DOCUMENT_KINDS = [
  "TERMO_RETIRADA_PDF",
  "COMPROVANTE_DEVOLUCAO_PDF",
  "OUTRO",
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "STATUS_CHANGE",
  "LOGIN",
  "GENERATE_PDF",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
