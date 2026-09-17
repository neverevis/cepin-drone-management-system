import { describe, it, expect } from "vitest";
import { percentSchema, isValidPeriod, timeToMinutes } from "@/lib/validators";

describe("percentSchema (carga de bateria)", () => {
  it("aceita valores entre 0 e 100", () => {
    expect(percentSchema.parse(0)).toBe(0);
    expect(percentSchema.parse(100)).toBe(100);
    expect(percentSchema.parse("57")).toBe(57);
  });

  it("rejeita valores acima de 100", () => {
    expect(() => percentSchema.parse(101)).toThrow();
  });

  it("rejeita valores negativos", () => {
    expect(() => percentSchema.parse(-1)).toThrow();
  });

  it("rejeita valores não inteiros", () => {
    expect(() => percentSchema.parse(50.5)).toThrow();
  });
});

describe("isValidPeriod", () => {
  it("retorna true quando o fim é depois do início", () => {
    expect(isValidPeriod(new Date("2025-01-01T08:00:00"), new Date("2025-01-01T10:00:00"))).toBe(true);
  });

  it("retorna false quando o fim é igual ao início", () => {
    const d = new Date("2025-01-01T08:00:00");
    expect(isValidPeriod(d, new Date(d))).toBe(false);
  });

  it("retorna false quando o fim é antes do início", () => {
    expect(isValidPeriod(new Date("2025-01-01T10:00:00"), new Date("2025-01-01T08:00:00"))).toBe(false);
  });
});

describe("timeToMinutes", () => {
  it("converte HH:mm em minutos desde a meia-noite", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("23:59")).toBe(23 * 60 + 59);
  });

  it("permite calcular a duração de uma atividade", () => {
    const duration = timeToMinutes("15:45") - timeToMinutes("14:15");
    expect(duration).toBe(90);
  });
});
