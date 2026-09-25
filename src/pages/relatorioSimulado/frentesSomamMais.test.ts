import { describe, expect, it } from "vitest";
import { frentesSomamMais } from "./frentesSomamMais";

describe("frentesSomamMais", () => {
  it("soma das frentes maior que a matéria", () => {
    expect(
      frentesSomamMais(2, [{ questoes: 2 }, { questoes: 1 }, { questoes: 1 }]),
    ).toBe(true);
  });

  it("fecha, ou fica abaixo: não", () => {
    expect(frentesSomamMais(2, [{ questoes: 1 }, { questoes: 1 }])).toBe(false);
    expect(frentesSomamMais(3, [{ questoes: 1 }])).toBe(false);
  });

  it("⚠️ sem a base (histórico antigo), nada de aviso", () => {
    expect(frentesSomamMais(undefined, [{ questoes: 5 }])).toBe(false);
    expect(frentesSomamMais(2, [{ questoes: 2 }, {}])).toBe(false);
  });
});
