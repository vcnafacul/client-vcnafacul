import { describe, expect, it } from "vitest";
import { inscritosDaProva } from "./inscritosDaProva";

describe("inscritosDaProva (tickets/039)", () => {
  it("prova de um simulado: como sempre", () => {
    expect(inscritosDaProva({ provaId: "p", nome: "Geral", inscritos: 4 })).toBe(
      "Geral: 4",
    );
  });

  it("Enem Dia 1: o total e quantos de cada língua", () => {
    expect(
      inscritosDaProva({
        provaId: "p",
        nome: "Enem Dia 1",
        inscritos: 5,
        simulados: [
          { simuladoId: "a", nome: "Enem Dia 1 Inglês", inscritos: 3 },
          { simuladoId: "b", nome: "Enem Dia 1 Espanhol", inscritos: 2 },
        ],
      }),
    ).toBe("Enem Dia 1: 5 (Inglês 3 · Espanhol 2)");
  });
});
