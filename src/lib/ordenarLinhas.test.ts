import { describe, expect, it } from "vitest";

import { ordenarLinhas } from "./ordenarLinhas";

type L = { nome: string | null; n: number };
const valores = { nome: (l: L) => l.nome, n: (l: L) => l.n };
const rows: L[] = [
  { nome: "b", n: 2 },
  { nome: null, n: 10 },
  { nome: "Á", n: 1 },
];

describe("ordenarLinhas", () => {
  it("sem sort ou coluna sem valor mantém a ordem", () => {
    expect(ordenarLinhas(rows, undefined, valores)).toBe(rows);
    expect(ordenarLinhas(rows, { columnId: "x", direction: "asc" }, valores)).toBe(rows);
  });

  it("texto ignora acento e vazio vai para o fim nas duas direções", () => {
    expect(ordenarLinhas(rows, { columnId: "nome", direction: "asc" }, valores).map((l) => l.nome)).toEqual(["Á", "b", null]);
    expect(ordenarLinhas(rows, { columnId: "nome", direction: "desc" }, valores).map((l) => l.nome)).toEqual(["b", "Á", null]);
  });

  it("número ordena como número", () => {
    expect(ordenarLinhas(rows, { columnId: "n", direction: "desc" }, valores).map((l) => l.n)).toEqual([10, 2, 1]);
  });
});
