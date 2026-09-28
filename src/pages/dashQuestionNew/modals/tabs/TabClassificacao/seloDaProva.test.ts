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

  it("prova oficial: da plataforma, ou protegida mesmo sendo de cursinho", () => {
    expect(seloDaProva({ podeComporProva: false, cursinhoId: null })!.tipo).toBe(
      "oficial",
    );
    expect(
      seloDaProva({ podeComporProva: false, cursinhoId: "A", protegida: true })!
        .texto,
    ).toBe("🔒 Prova oficial");
  });

  it("sem prova em foco: nada", () => {
    expect(seloDaProva(undefined)).toBeNull();
    expect(podeCompor(undefined)).toBe(false);
  });
});
