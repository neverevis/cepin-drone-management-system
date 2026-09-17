import { describe, it, expect } from "vitest";
import { monthGrid, weekGrid, navigate } from "@/lib/agenda";

describe("monthGrid", () => {
  it("sempre retorna semanas completas (múltiplo de 7 dias)", () => {
    const days = monthGrid(new Date(2025, 1, 15)); // fevereiro/2025
    expect(days.length % 7).toBe(0);
  });

  it("inclui o primeiro e o último dia do mês", () => {
    const days = monthGrid(new Date(2025, 1, 15));
    const hasFirst = days.some((d) => d.getMonth() === 1 && d.getDate() === 1);
    const hasLast = days.some((d) => d.getMonth() === 1 && d.getDate() === 28);
    expect(hasFirst).toBe(true);
    expect(hasLast).toBe(true);
  });
});

describe("weekGrid", () => {
  it("retorna exatamente 7 dias", () => {
    expect(weekGrid(new Date(2025, 1, 15)).length).toBe(7);
  });
});

describe("navigate", () => {
  it("avança um mês na visualização mensal", () => {
    const next = navigate("mes", new Date(2025, 0, 15), 1);
    expect(next.getMonth()).toBe(1);
  });

  it("volta um mês na visualização mensal", () => {
    const prev = navigate("mes", new Date(2025, 0, 15), -1);
    expect(prev.getMonth()).toBe(11);
    expect(prev.getFullYear()).toBe(2024);
  });

  it("avança uma semana na visualização semanal", () => {
    const next = navigate("semana", new Date(2025, 0, 1), 1);
    expect(next.getDate()).toBe(8);
  });
});
