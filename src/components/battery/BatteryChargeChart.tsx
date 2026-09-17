"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface ChargePoint {
  date: string; // já formatado (dd/MM HH:mm)
  percent: number;
  label: string;
}

export function BatteryChargeChart({ data }: { data: ChargePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sem histórico de carga registrado ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" fontSize={11} stroke="#9ca3af" />
        <YAxis domain={[0, 100]} fontSize={11} stroke="#9ca3af" />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Carga"]}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
        />
        <Line type="monotone" dataKey="percent" stroke="#2f7d38" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
