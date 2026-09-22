import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { describe, expect, it } from "vitest";
import {
  acertoGlobal,
  MINIMO_PARA_DIFICULDADE_GLOBAL,
  temDificuldadeGlobal,
  textoDaDificuldadeGlobal,
} from "./dificuldadeGlobal";

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 34,
  questaoId: "q34",
  respondentes: 27,
  acertos: 6,
  erros: 19,
  semLeitura: 2,
  porAlternativa: { A: 2, B: 16, C: 6, D: 1, E: 0 },
  alternativaCorreta: "C",
  discriminacao: 0.4,
  ...over,
});

describe("acertoGlobal", () => {
  it("é o percentual da base inteira", () => {
    expect(
      acertoGlobal(questao({ acertosGeral: 443, baseGeral: 1847 })),
    ).toBe(24);
  });

  it("⚠️ api sem os campos devolve null, e não 0%", () => {
    // Zero por cento diria "ninguém no país acertou" — uma afirmação, e
    // provavelmente falsa. Aqui não se sabe.
    expect(acertoGlobal(questao())).toBeNull();
  });

  it("⚠️ base abaixo do mínimo é null", () => {
    /*
      Comparar 22% da turma com 24% de 12 respostas não responde nada. A coluna
      existe para a turma se COMPARAR com a base, e uma base minúscula é ruído
      com cara de referência.
    */
    expect(
      acertoGlobal(
        questao({
          acertosGeral: 3,
          baseGeral: MINIMO_PARA_DIFICULDADE_GLOBAL - 1,
        }),
      ),
    ).toBeNull();
  });

  it("no mínimo exato, já vale", () => {
    expect(
      acertoGlobal(
        questao({ acertosGeral: 15, baseGeral: MINIMO_PARA_DIFICULDADE_GLOBAL }),
      ),
    ).toBe(50);
  });

  it("base zero é null, nunca divisão por zero", () => {
    expect(acertoGlobal(questao({ acertosGeral: 0, baseGeral: 0 }))).toBeNull();
  });

  it("⚠️ acertos ausente com base presente também é null", () => {
    // Meio contrato é contrato quebrado: calcular com `undefined` daria NaN.
    expect(acertoGlobal(questao({ baseGeral: 1847 }))).toBeNull();
  });
});

describe("textoDaDificuldadeGlobal", () => {
  it("⚠️ a base entra no TEXTO, não num tooltip", () => {
    /*
      Duas colunas de percentual lado a lado com números diferentes precisam se
      explicar sozinhas: "24% de 1.847" e "24% de 34" pedem confianças opostas,
      e esconder a base num hover joga a decisão para quem nem sabe que há o que
      conferir.
    */
    expect(
      textoDaDificuldadeGlobal(questao({ acertosGeral: 443, baseGeral: 1847 })),
    ).toBe("24% de 1.847");
  });

  it("separador de milhar em pt-BR", () => {
    expect(
      textoDaDificuldadeGlobal(
        questao({ acertosGeral: 2500, baseGeral: 10000 }),
      ),
    ).toContain("10.000");
  });

  it("sem base suficiente não tem texto", () => {
    expect(textoDaDificuldadeGlobal(questao())).toBeNull();
  });
});

describe("temDificuldadeGlobal", () => {
  it("basta UMA questão com base para a coluna existir", () => {
    expect(
      temDificuldadeGlobal([
        questao(),
        questao({ acertosGeral: 443, baseGeral: 1847 }),
      ]),
    ).toBe(true);
  });

  it("⚠️ nenhuma com base = sem coluna, e não uma coluna de travessões", () => {
    /*
      Numa tabela cuja folga de largura é medida a cada card, uma coluna que não
      diz nada custa 136px e ainda sugere que o dado deveria estar ali. Mesmo
      raciocínio do `materiasVisiveis` (card 07).
    */
    expect(temDificuldadeGlobal([questao(), questao({ baseGeral: 5 })])).toBe(
      false,
    );
  });

  it("lista vazia não tem coluna", () => {
    expect(temDificuldadeGlobal([])).toBe(false);
  });
});
