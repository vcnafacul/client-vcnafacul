import { describe, expect, it } from "vitest";
import { textoDaExclusaoDePeriodo } from "./textoDaExclusaoDePeriodo";

describe("textoDaExclusaoDePeriodo (tickets-documentacao, 06)", () => {
  it("diz quantas faltas voltam a ser comuns", () => {
    expect(textoDaExclusaoDePeriodo(3)).toBe(
      "3 faltas voltarão a ser faltas comuns. Justificativas lançadas individualmente não mudam.",
    );
    expect(textoDaExclusaoDePeriodo(1)).toBe(
      "1 falta voltará a ser falta comum. Justificativas lançadas individualmente não mudam.",
    );
  });

  it("sem faltas justificadas não promete mudança", () => {
    expect(textoDaExclusaoDePeriodo(0)).toBe(
      "Nenhuma falta foi justificada por ela.",
    );
  });

  it("sem o número (api antiga), avisa sem contar", () => {
    expect(textoDaExclusaoDePeriodo(undefined)).toMatch(
      /^As faltas justificadas por ela voltarão a ser faltas comuns\./,
    );
  });
});
