import { describe, expect, it } from "vitest";
import { contagem } from "@/services/indicadores";
import { pontosSemanais } from "./serie";

const ponto = (dia: string, ativos?: number) => ({
  dia,
  metricas: ativos === undefined ? {} : { ativos },
});

describe("pontosSemanais", () => {
  it("fica com o último dia de cada semana (segunda a domingo)", () => {
    // 2026-10-05 é segunda
    const serie = [
      ponto("2026-10-05", 10),
      ponto("2026-10-09", 9),
      ponto("2026-10-11", 8), // domingo: ainda a mesma semana
      ponto("2026-10-12", 7), // segunda: semana nova
    ];
    expect(
      pontosSemanais(serie, (m) => contagem(m, "ativos")),
    ).toEqual([
      { dia: "2026-10-11", rotulo: "11/10", valor: 8 },
      { dia: "2026-10-12", rotulo: "12/10", valor: 7 },
    ]);
  });

  it("dia sem a métrica vira null, não zero", () => {
    expect(
      pontosSemanais([ponto("2026-10-05")], (m) => contagem(m, "ativos")),
    ).toEqual([{ dia: "2026-10-05", rotulo: "05/10", valor: null }]);
  });
});
