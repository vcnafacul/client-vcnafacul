import { describe, expect, it } from "vitest";
import { porcentagem, taxa } from "./formato";

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
