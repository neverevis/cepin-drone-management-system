const PATHS: Record<string, string> = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  drone: "M12 2v4m0 12v4M2 12h4m12 0h4M6 6l2.5 2.5M17.5 17.5 20 20M6 18l2.5-2.5M17.5 6.5 20 4M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z",
  battery: "M3 9a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm18 2v2h1v-2h-1ZM6 10h7v4H6v-4Z",
  calendar: "M8 2v3m8-3v3M3.5 9h17M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  clipboard: "M9 3h6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1Zm0 3h6V4H9v2Z",
  upload: "M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3",
  flight: "m2 12 8-2 3-7 2 1-2 6 5-1v2l-5 1 1 5-2 1-2-6-3 6-1-1 1-4-4-1v-... ",
  download: "M12 4v12m0 0 4-4m-4 4-4-4M4 20h16",
  alert: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
  chart: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  users: "M16 14a4 4 0 1 0-8 0m10 6v-1a5 5 0 0 0-5-5h-2a5 5 0 0 0-5 5v1m14-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.15-1.5l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14.5 2h-5l-.35 2.5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.6a8 8 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L9.5 22h5l.35-2.5a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.6A8 8 0 0 0 20 12Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 4 4 4-4 4m4-4H9",
};

// Ícone de voo simplificado (avião de papel), evitando path complexo demais
PATHS.flight = "m3 11 17-8-8 17-2-7-7-2Z";

export function Icon({ name, className }: { name: string; className?: string }) {
  const d = PATHS[name] ?? PATHS.dashboard;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
