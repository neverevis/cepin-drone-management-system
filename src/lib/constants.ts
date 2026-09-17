export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  RESPONSAVEL_CEPIN: "Responsável pelo CEPIN",
  USUARIO_AUTORIZADO: "Usuário Autorizado",
  OPERADOR_CONFERENTE: "Operador / Conferente",
};

export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  INDISPONIVEL: "Indisponível",
  BAIXADO: "Baixado",
};

export const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-800 border-green-300",
  RESERVADO: "bg-sky-100 text-sky-800 border-sky-300",
  EM_USO: "bg-blue-100 text-blue-800 border-blue-300",
  EM_MANUTENCAO: "bg-amber-100 text-amber-800 border-amber-300",
  INDISPONIVEL: "bg-red-100 text-red-800 border-red-300",
  BAIXADO: "bg-gray-100 text-gray-600 border-gray-300",
};

export const ACCESSORY_TYPE_LABELS: Record<string, string> = {
  CONTROLE_REMOTO: "Controle Remoto",
  HELICES: "Hélices",
  CABO: "Cabo",
  MALETA: "Maleta / Case de Transporte",
  MODULO_RTK: "Módulo RTK",
  FILTRO_ND: "Filtro ND",
  CARREGADOR: "Carregador / Hub de Carga",
  OUTRO: "Outro",
};

export const ACCESSORY_STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  INDISPONIVEL: "Indisponível",
};

export const BATTERY_STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EM_USO: "Em uso",
  CARREGANDO: "Carregando",
  EM_MANUTENCAO: "Em manutenção",
  INDISPONIVEL: "Indisponível",
};

export const BATTERY_STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-800 border-green-300",
  EM_USO: "bg-blue-100 text-blue-800 border-blue-300",
  CARREGANDO: "bg-violet-100 text-violet-800 border-violet-300",
  EM_MANUTENCAO: "bg-amber-100 text-amber-800 border-amber-300",
  INDISPONIVEL: "bg-red-100 text-red-800 border-red-300",
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  SOLICITADA: "Solicitada",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  RETIRADA: "Retirada",
  EM_USO: "Em uso",
  DEVOLVIDA: "Devolvida",
  CANCELADA: "Cancelada",
  ENCERRADA: "Encerrada",
};

export const RESERVATION_STATUS_COLORS: Record<string, string> = {
  RASCUNHO: "bg-gray-100 text-gray-600 border-gray-300",
  SOLICITADA: "bg-sky-100 text-sky-800 border-sky-300",
  EM_ANALISE: "bg-amber-100 text-amber-800 border-amber-300",
  APROVADA: "bg-green-100 text-green-800 border-green-300",
  REJEITADA: "bg-red-100 text-red-800 border-red-300",
  RETIRADA: "bg-blue-100 text-blue-800 border-blue-300",
  EM_USO: "bg-blue-100 text-blue-800 border-blue-300",
  DEVOLVIDA: "bg-teal-100 text-teal-800 border-teal-300",
  CANCELADA: "bg-gray-100 text-gray-600 border-gray-300",
  ENCERRADA: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export const WITHDRAWAL_STATUS_LABELS: Record<string, string> = {
  ABERTA: "Em aberto",
  DEVOLVIDA: "Devolvida",
  CANCELADA: "Cancelada",
};

export const WITHDRAWAL_STATUS_COLORS: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-800 border-blue-300",
  DEVOLVIDA: "bg-green-100 text-green-800 border-green-300",
  CANCELADA: "bg-gray-100 text-gray-600 border-gray-300",
};

export const FLIGHT_ACTIVITY_TYPE_LABELS: Record<string, string> = {
  MAPEAMENTO: "Mapeamento",
  AGRICULTURA_PRECISAO: "Agricultura de Precisão",
  PESQUISA: "Pesquisa / Experimento",
  AULA: "Aula",
  TREINAMENTO: "Treinamento",
  INSPECAO: "Inspeção",
  OUTRO: "Outro",
};

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  AVARIA: "Avaria",
  FALHA_FUNCIONAMENTO: "Falha de Funcionamento",
  PROBLEMA_BATERIA: "Problema de Bateria",
  PERDA_EXTRAVIO: "Perda / Extravio",
  FURTO: "Furto",
  ACIDENTE: "Acidente",
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  BAIXA: "bg-gray-100 text-gray-700 border-gray-300",
  MEDIA: "bg-amber-100 text-amber-800 border-amber-300",
  ALTA: "bg-orange-100 text-orange-800 border-orange-300",
  CRITICA: "bg-red-100 text-red-800 border-red-300",
};

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  EM_PROVIDENCIA: "Em providência",
  RESOLVIDA: "Resolvida",
  ENCERRADA: "Encerrada",
};

export const INCIDENT_STATUS_COLORS: Record<string, string> = {
  ABERTA: "bg-red-100 text-red-800 border-red-300",
  EM_ANALISE: "bg-amber-100 text-amber-800 border-amber-300",
  EM_PROVIDENCIA: "bg-sky-100 text-sky-800 border-sky-300",
  RESOLVIDA: "bg-green-100 text-green-800 border-green-300",
  ENCERRADA: "bg-gray-100 text-gray-600 border-gray-300",
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  CALIBRACAO: "Calibração (Bússola/UMI/Gimbal/Controle)",
  ATUALIZACAO_FIRMWARE: "Atualização de Firmware",
  LIMPEZA: "Limpeza",
  INSPECAO: "Inspeção",
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  AGENDADA: "Agendada",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  AGENDADA: "bg-amber-100 text-amber-800 border-amber-300",
  EM_ANDAMENTO: "bg-blue-100 text-blue-800 border-blue-300",
  CONCLUIDA: "bg-green-100 text-green-800 border-green-300",
  CANCELADA: "bg-gray-100 text-gray-600 border-gray-300",
};

// Checklist de pré-voo / entrega, baseado no manual do DJI Mavic 3M e no DJI Pilot 2
export const PICKUP_CHECKLIST_ITEMS = [
  { key: "aeronave", label: "Aeronave (drone) presente e sem avarias visíveis" },
  { key: "controle", label: "Controle remoto presente e funcional" },
  { key: "helices", label: "Hélices presas com segurança, sem danos ou deformações" },
  { key: "bateria1", label: "Bateria 1 (principal) presente e carregada" },
  { key: "bateria2", label: "Bateria 2 (extra) presente" },
  { key: "bateria3", label: "Bateria 3 (extra) presente" },
  { key: "bateria4", label: "Bateria 4 (extra) presente" },
  { key: "carregador", label: "Carregador / hub de carga presente" },
  { key: "cartaoSd", label: "Cartão microSD inserido e compartimento fechado" },
  { key: "demaisAcessorios", label: "Demais acessórios (filtro ND, cabos, maleta) presentes" },
  { key: "condicoesFisicas", label: "Condições físicas gerais conferidas" },
] as const;

// Itens de checagem na devolução
export const RETURN_CHECKLIST_ITEMS = [
  { key: "aeronave", label: "Aeronave sem avarias visíveis na fuselagem, hélices e sensores" },
  { key: "controle", label: "Controle remoto em bom estado de funcionamento" },
  { key: "bateria1", label: "Bateria 1 (principal) devolvida" },
  { key: "bateria2", label: "Bateria 2 (extra) devolvida" },
  { key: "bateria3", label: "Bateria 3 (extra) devolvida" },
  { key: "bateria4", label: "Bateria 4 (extra) devolvida" },
  { key: "carregador", label: "Carregador / hub de carga devolvido" },
  { key: "cartaoSd", label: "Cartão de memória devolvido com dados descarregados" },
  { key: "demaisAcessorios", label: "Demais acessórios conferidos e completos" },
  { key: "maleta", label: "Maleta / case de transporte em bom estado" },
] as const;
