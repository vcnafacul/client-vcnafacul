import { describe, expect, it } from "vitest";
import { passosDaLista } from "./passosDaLista";

describe("passosDaLista — anterior/próxima entre as filtradas", () => {
  const p = (indice: number, pagina = 1, total = 100, limite = 40) =>
    passosDaLista({ indice, pagina, limite, total });

  it("no meio da página: vizinhas na mesma página", () => {
    expect(p(5)).toEqual({
      anterior: { tipo: "mesmaPagina", indice: 4 },
      proxima: { tipo: "mesmaPagina", indice: 6 },
      posicao: 6,
    });
  });

  it("a primeira de todas: sem anterior", () => {
    expect(p(0).anterior).toBeNull();
    expect(p(0).posicao).toBe(1);
  });

  it("a última de todas (última página incompleta): sem próxima", () => {
    // 100 no total, 40 por página: a página 3 tem 20 (índices 0..19)
    expect(p(19, 3).proxima).toBeNull();
    expect(p(19, 3).posicao).toBe(100);
  });

  it("⚠️ fim da página: a próxima carrega a página seguinte e abre a primeira", () => {
    expect(p(39, 1).proxima).toEqual({
      tipo: "outraPagina",
      pagina: 2,
      abrir: "primeira",
    });
  });

  it("⚠️ início da página 2: a anterior carrega a 1 e abre a última", () => {
    expect(p(0, 2).anterior).toEqual({
      tipo: "outraPagina",
      pagina: 1,
      abrir: "ultima",
    });
    expect(p(0, 2).posicao).toBe(41);
  });

  it("questão fora da lista (ex.: excluída): sem navegação", () => {
    expect(p(-1)).toEqual({ anterior: null, proxima: null, posicao: null });
  });

  it("lista de uma só: nem anterior nem próxima", () => {
    expect(p(0, 1, 1)).toMatchObject({ anterior: null, proxima: null });
  });
});
