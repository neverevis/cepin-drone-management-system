import { describe, it, expect } from "vitest";
import { formatMinutes, generateSequentialCode, toQueryString } from "@/lib/utils";

describe("formatMinutes", () => {
  it("formata minutos puros", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });

  it("formata horas exatas", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formata horas e minutos", () => {
    expect(formatMinutes(125)).toBe("2h 5min");
  });
});

describe("generateSequentialCode", () => {
  it("gera código no formato PREFIXO-ANO-NNNN", async () => {
    const code = await generateSequentialCode("RET", async () => 0);
    const year = new Date().getFullYear();
    expect(code).toBe(`RET-${year}-0001`);
  });

  it("incrementa a partir da contagem informada", async () => {
    const code = await generateSequentialCode("SOL", async () => 41);
    const year = new Date().getFullYear();
    expect(code).toBe(`SOL-${year}-0042`);
  });
});

describe("toQueryString", () => {
  it("ignora valores vazios/undefined", () => {
    const qs = toQueryString({ a: "1", b: undefined, c: "" });
    expect(qs).toBe("a=1");
  });

  it("inclui múltiplos parâmetros preenchidos", () => {
    const qs = toQueryString({ a: "1", b: "2" });
    expect(qs).toContain("a=1");
    expect(qs).toContain("b=2");
  });
});
