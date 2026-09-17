export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  TECNICO: "Técnico de Manutenção",
  PILOTO: "Piloto / Pesquisador",
};

export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  AERONAVE: "Aeronave",
  BATERIA: "Bateria de Voo Inteligente",
  CONTROLE_REMOTO: "Controle Remoto",
  HELICES: "Hélices",
  MODULO_RTK: "Módulo RTK",
  FILTRO_ND: "Filtro ND",
  CARREGADOR: "Carregador / Hub de Carga",
  CARTAO_MEMORIA: "Cartão de Memória (microSD)",
  CABO: "Cabo",
  CASE_MALETA: "Case / Maleta de Transporte",
  OUTRO: "Outro",
};

export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  INATIVO: "Inativo",
};

export const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-800 border-green-300",
  EM_USO: "bg-blue-100 text-blue-800 border-blue-300",
  EM_MANUTENCAO: "bg-amber-100 text-amber-800 border-amber-300",
  INATIVO: "bg-gray-100 text-gray-600 border-gray-300",
};

export const LOAN_STATUS_LABELS: Record<string, string> = {
  ABERTA: "Em aberto",
  DEVOLVIDA: "Devolvida",
  CANCELADA: "Cancelada",
};

export const LOAN_STATUS_COLORS: Record<string, string> = {
  ABERTA: "bg-blue-100 text-blue-800 border-blue-300",
  DEVOLVIDA: "bg-green-100 text-green-800 border-green-300",
  CANCELADA: "bg-gray-100 text-gray-600 border-gray-300",
};

export const FLIGHT_TYPE_LABELS: Record<string, string> = {
  MAPEAMENTO_2D: "Mapeamento 2D (Ortomosaico)",
  MODELO_3D: "Modelo 3D (Coleta Oblíqua)",
  INSPECAO: "Inspeção",
  TREINAMENTO: "Treinamento",
  PESQUISA: "Pesquisa / Experimento",
  OUTRO: "Outro",
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  CALIBRACAO: "Calibração (Bússola/UMI/Gimbal/Controle)",
  ATUALIZACAO_FIRMWARE: "Atualização de Firmware",
  LIMPEZA: "Limpeza",
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

// Checklist de pré-voo baseado no manual do DJI Mavic 3M / DJI Pilot 2
export const PRE_FLIGHT_CHECKLIST_ITEMS = [
  "Controle remoto e baterias do Mavic totalmente carregados",
  "Braços e hélices desdobrados corretamente",
  "Hélices presas com segurança, sem danos ou deformações",
  "Sistemas visuais, infravermelho e câmeras limpos e sem obstruções",
  "Proteção do gimbal (estabilizador) removida",
  "Cartão microSD inserido e compartimento fechado corretamente",
  "DJI Pilot 2 e firmware do Mavic atualizados",
  "Ambiente de voo verificado (sem obstáculos, edifícios, árvores ou multidões)",
  "Modos de controle, altura de RTH e detecção de obstáculos conferidos no DJI Pilot 2",
  "Condições climáticas adequadas (sem chuva, vento forte ou baixa visibilidade)",
];

// Itens de checagem na devolução
export const RETURN_CHECKLIST_ITEMS = [
  "Aeronave sem avarias visíveis na fuselagem, hélices e sensores",
  "Baterias devolvidas e níveis de carga registrados",
  "Controle remoto em bom estado de funcionamento",
  "Cartão de memória devolvido com os dados descarregados",
  "Acessórios (filtros ND, cabos, módulo RTK) conferidos e completos",
  "Case / maleta de transporte em bom estado",
];
