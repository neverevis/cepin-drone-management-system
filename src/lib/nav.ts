import type { Permission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // nome simples usado pelo componente Icon
  permission?: Permission; // se ausente, visível para qualquer usuário autenticado
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/equipamentos", label: "Equipamentos", icon: "drone", permission: "equipment.view" },
  { href: "/baterias", label: "Baterias", icon: "battery", permission: "equipment.view" },
  { href: "/agenda", label: "Agenda", icon: "calendar", permission: "equipment.view" },
  { href: "/solicitacoes", label: "Solicitações", icon: "clipboard", permission: "equipment.view" },
  { href: "/retiradas", label: "Retiradas", icon: "upload", permission: "withdrawals.view" },
  { href: "/utilizacoes", label: "Utilizações", icon: "flight", permission: "withdrawals.view" },
  { href: "/devolucoes", label: "Devoluções", icon: "download", permission: "withdrawals.view" },
  { href: "/ocorrencias", label: "Ocorrências e Manutenção", icon: "alert", permission: "equipment.view" },
  { href: "/relatorios", label: "Relatórios", icon: "chart", permission: "reports.view" },
  { href: "/usuarios", label: "Usuários", icon: "users", permission: "users.manage" },
  { href: "/configuracoes", label: "Configurações", icon: "settings", permission: "settings.manage" },
];
