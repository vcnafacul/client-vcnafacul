import { describe, expect, it } from "vitest";
import { areasPermitidas, mantemArea } from "./areasPermitidas";

const TODAS = [
  "Ciências Humanas",
  "Linguagens",
  "Ciências da Natureza",
  "Matemática",
];
const enemDia1_2017 = { enemAreas: ["Linguagens", "Ciências Humanas"] };
const enemDia2_2017 = { enemAreas: ["Ciências da Natureza", "Matemática"] };
const enemDia2_2015 = { enemAreas: ["Linguagens", "Matemática"] };
const custom = { enemAreas: [] };

describe("areasPermitidas (area-enem 02)", () => {
  it("⚠️ sem prova: as 4 áreas — a área nunca trava por falta de prova", () => {
    expect(areasPermitidas([])).toEqual({ areas: TODAS, conflito: false });
  });

  it("⚠️ prova customizada não restringe", () => {
    // Antes, `enemAreas = []` deixava o select vazio e desabilitado.
    expect(areasPermitidas([custom]).areas).toEqual(TODAS);
  });

  it("prova ENEM: só as do dia", () => {
    expect(areasPermitidas([enemDia2_2017]).areas).toEqual([
      "Ciências da Natureza",
      "Matemática",
    ]);
  });

  it("ENEM + customizada: a ENEM decide", () => {
    expect(areasPermitidas([custom, enemDia1_2017]).areas).toEqual([
      "Ciências Humanas",
      "Linguagens",
    ]);
  });

  it("⚠️ várias ENEM: a interseção — a área é da questão, não do vínculo", () => {
    expect(areasPermitidas([enemDia2_2017, enemDia2_2015]).areas).toEqual([
      "Matemática",
    ]);
  });

  it("⚠️ interseção vazia: as 4 com conflito, sem travar", () => {
    expect(areasPermitidas([enemDia1_2017, enemDia2_2017])).toEqual({
      areas: TODAS,
      conflito: true,
    });
  });

  it("a ordem segue a lista das 4 áreas, não a da prova", () => {
    expect(areasPermitidas([enemDia1_2017]).areas).toEqual([
      "Ciências Humanas",
      "Linguagens",
    ]);
  });
});

describe("mantemArea (area-enem 02)", () => {
  it("⚠️ trocar para prova que ainda aceita a área: mantém", () => {
    expect(mantemArea("Matemática", [enemDia2_2015])).toBe(true);
  });

  it("trocar para prova que não aceita: limpa", () => {
    expect(mantemArea("Linguagens", [enemDia2_2017])).toBe(false);
  });

  it("customizada aceita qualquer área", () => {
    expect(mantemArea("Linguagens", [custom])).toBe(true);
  });

  it("sem área escolhida, nada a limpar", () => {
    expect(mantemArea("", [enemDia2_2017])).toBe(true);
  });
});
