import { describe, expect, it } from "vitest";
import { evasao, porcentagem, taxa } from "./formato";

describe("taxa e porcentagem", () => {
  it("uma casa decimal, vírgula do pt-BR", () => {
    expect(porcentagem(taxa(16, 114))).toBe("14%");
    expect(porcentagem(taxa(15, 110))).toBe("13,6%");
  });

  it("sem denominador (ou sem dado) → null, nunca 0%", () => {
    expect(taxa(0, 0)).toBeNull();
    expect(taxa(null, 10)).toBeNull();
    expect(porcentagem(null)).toBeNull();
  });
});

describe("evasão", () => {
  it("exemplo do README: 120 alunos, 22 cancelamentos, 6 desistências iniciais → 14%", () => {
    expect(
      evasao({ alunos: 120, cancelados: 22, desistenciaInicial: 6 }),
    ).toBe(14);
  });

  it("⚠️ soma antes de dividir: 10% de 100 e 50% de 10 → 13,6%, não 30%", () => {
    expect(evasao({ alunos: 110, cancelados: 15, desistenciaInicial: 0 })).toBe(
      13.6,
    );
  });

  it("sem alunos ou sem o dado → null", () => {
    expect(evasao({ alunos: 0, cancelados: 0 })).toBeNull();
    expect(evasao({ alunos: 5 })).toBeNull();
    expect(evasao(undefined)).toBeNull();
  });
});
