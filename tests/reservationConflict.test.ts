import { describe, it, expect } from "vitest";
import { intervalsOverlap } from "@/lib/reservationConflict";

describe("intervalsOverlap (conflito de agenda)", () => {
  const day = (h: number, m = 0) => new Date(2025, 0, 10, h, m);

  it("detecta sobreposição quando os intervalos se cruzam", () => {
    // 08:00-12:00 vs 10:00-14:00 -> conflita
    expect(intervalsOverlap(day(8), day(12), day(10), day(14))).toBe(true);
  });

  it("detecta sobreposição quando um intervalo contém o outro", () => {
    expect(intervalsOverlap(day(8), day(18), day(10), day(12))).toBe(true);
  });

  it("não detecta conflito quando os intervalos são adjacentes (fim = início)", () => {
    // 08:00-10:00 vs 10:00-12:00 -> não conflita (devolução e nova retirada no mesmo instante)
    expect(intervalsOverlap(day(8), day(10), day(10), day(12))).toBe(false);
  });

  it("não detecta conflito quando os intervalos são totalmente distintos", () => {
    expect(intervalsOverlap(day(8), day(9), day(14), day(16))).toBe(false);
  });

  it("é simétrico (a,b) === (b,a)", () => {
    const a = intervalsOverlap(day(8), day(12), day(10), day(14));
    const b = intervalsOverlap(day(10), day(14), day(8), day(12));
    expect(a).toBe(b);
  });
});
