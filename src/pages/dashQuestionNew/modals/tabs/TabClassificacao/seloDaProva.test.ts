import { describe, expect, it } from "vitest";
import { podeCompor, seloDaProva } from "./seloDaProva";

describe("seloDaProva (023 · 08)", () => {
  it("quem compõe não vê selo", () => {
    expect(seloDaProva({ podeComporProva: true, cursinhoId: "A" })).toBeNull();
  });

  it("⚠️ api antiga (sem o campo) = como antes: compõe, sem selo", () => {
    expect(podeCompor({})).toBe(true);
    expect(seloDaProva({})).toBeNull();
  });

  it("prova de outro cursinho", () => {
    expect(
      seloDaProva({ podeComporProva: false, cursinhoId: "B", cursinhoNome: "Vila" }),
    ).toEqual({ tipo: "cursinho", texto: "🏫 Prova do cursinho Vila" });
    expect(seloDaProva({ podeComporProva: false, cursinhoId: "B" })!.texto).toBe(
      "🏫 Prova de outro cursinho",
    );
  });

  it("⚠️ oficial é SÓ a de categoria não selecionável", () => {
    expect(
      seloDaProva({ podeComporProva: false, cursinhoId: null, selecionavel: false }),
    ).toEqual({ tipo: "oficial", texto: "🔒 Prova oficial" });
    expect(
      seloDaProva({ podeComporProva: false, cursinhoId: "A", selecionavel: false })!
        .tipo,
    ).toBe("oficial");
  });

  it("prova da plataforma com categoria selecionável não é oficial", () => {
    expect(
      seloDaProva({ podeComporProva: false, cursinhoId: null, selecionavel: true }),
    ).toEqual({ tipo: "plataforma", texto: "🏛️ Prova da plataforma" });
    expect(seloDaProva({ podeComporProva: false, cursinhoId: null })!.tipo).toBe(
      "plataforma",
    );
  });

  it("prova de cursinho em categoria do sistema (selecionável) é do cursinho", () => {
    expect(
      seloDaProva({
        podeComporProva: false,
        cursinhoId: "A",
        cursinhoNome: "Vila",
        protegida: true,
        selecionavel: true,
      })!.tipo,
    ).toBe("cursinho");
  });

  it("sem prova em foco: nada", () => {
    expect(seloDaProva(undefined)).toBeNull();
    expect(podeCompor(undefined)).toBe(false);
  });
});
