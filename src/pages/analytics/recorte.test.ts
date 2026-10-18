import { describe, expect, it } from "vitest";
import { cursinhoDaUrl, filtrarCursinhos } from "./recorte";

const lista = [
  { id: "2", name: "Pré-Vestibular São José" },
  { id: "1", name: "Cursinho Alfa" },
  { id: "3", name: "Educafro Brás" },
];

describe("recorte do monitoramento (044/06)", () => {
  it("ordena por nome e busca sem acento nem caixa", () => {
    expect(filtrarCursinhos(lista, "").map((c) => c.id)).toEqual(["1", "3", "2"]);
    expect(filtrarCursinhos(lista, "sao jose").map((c) => c.id)).toEqual(["2"]);
    expect(filtrarCursinhos(lista, "BRAS").map((c) => c.id)).toEqual(["3"]);
    expect(filtrarCursinhos(lista, "zzz")).toEqual([]);
  });

  it("id da URL só vale se estiver na lista", () => {
    expect(cursinhoDaUrl("3", lista)?.name).toBe("Educafro Brás");
    expect(cursinhoDaUrl("x", lista)).toBeNull();
    expect(cursinhoDaUrl(null, lista)).toBeNull();
  });
});
