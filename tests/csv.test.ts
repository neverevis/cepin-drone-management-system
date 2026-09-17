import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("gera cabeçalho e linhas separados por ponto e vírgula", () => {
    const csv = toCsv(["Nome", "Idade"], [["Ana", 30]]);
    expect(csv).toContain("Nome;Idade");
    expect(csv).toContain("Ana;30");
  });

  it("escapa valores que contêm ponto e vírgula ou aspas", () => {
    const csv = toCsv(["Descrição"], [['Contém "aspas"; e ponto e vírgula']]);
    expect(csv).toContain('"Contém ""aspas""; e ponto e vírgula"');
  });

  it("trata valores nulos/indefinidos como célula vazia", () => {
    const csv = toCsv(["A", "B"], [[null, undefined]]);
    const lines = csv.replace("﻿", "").split("\r\n");
    expect(lines[1]).toBe(";");
  });
});
