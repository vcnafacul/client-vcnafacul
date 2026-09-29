import { describe, expect, it } from "vitest";
import {
  normalizarEnquantoDigita,
  normalizarSlug,
  quemSomosVazio,
  slugValido,
} from "./regrasDaPagina";

describe("slug da página do cursinho (025 · 06)", () => {
  it.each([
    ["Cursinho São João", "cursinho-sao-joao"],
    ["  Ação & Cia!! ", "acao-cia"],
    ["MAIÚSCULAS", "maiusculas"],
  ])("normalizarSlug(%p) → %p", (entrada, esperado) => {
    expect(normalizarSlug(entrada)).toBe(esperado);
    expect(slugValido(normalizarSlug(entrada))).toBe(true);
  });

  it("⚠️ enquanto digita, o hífen do fim fica (senão não dá para digitar meu-cursinho)", () => {
    expect(normalizarEnquantoDigita("meu ")).toBe("meu-");
    expect(normalizarEnquantoDigita("meu-")).toBe("meu-");
    expect(normalizarEnquantoDigita("meu--c")).toBe("meu-c");
    expect(normalizarEnquantoDigita("-inicio")).toBe("inicio");
  });

  it.each([
    ["", true],
    ["  \n", true],
    ["**\n#", true],
    ["Somos", false],
  ])("quemSomosVazio(%p) → %p", (t, esperado) => {
    expect(quemSomosVazio(t)).toBe(esperado);
  });

  it.each([
    ["ok-slug", true],
    ["ab", false],
    ["a".repeat(61), false],
    ["fim-", false],
  ])("slugValido(%p) → %p", (slug, esperado) => {
    expect(slugValido(slug)).toBe(esperado);
  });
});
