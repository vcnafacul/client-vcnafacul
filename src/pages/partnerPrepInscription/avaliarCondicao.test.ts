import { describe, expect, it } from "vitest";
import {
  BaseCondition,
  Logic,
  Operator,
} from "@/types/partnerPrepForm/condition";
import { avaliarCondicao, avaliarCondicaoSimples } from "./avaliarCondicao";

/**
 * ⚠️ Tabela espelhada em `vcnafacul-form/src/modules/submission/utils/
 * evaluate-conditions.spec.ts`: tela e submissão têm de dar o mesmo resultado.
 * [operador, esperado (sempre texto), resposta, resultado]
 */
const TABELA: [Operator, string, unknown, boolean][] = [
  // Texto
  [Operator.Equal, "Sim", "Sim", true],
  [Operator.Equal, "Sim", "Não", false],
  [Operator.NotEqual, "Sim", "Não", true],
  [Operator.NotEqual, "Sim", "Sim", false],
  // Número (resposta number, esperado string)
  [Operator.Equal, "3", 3, true],
  [Operator.NotEqual, "0", 0, false],
  [Operator.NotEqual, "0", 2, true],
  [Operator.GreaterThan, "2", 3, true],
  [Operator.LessThanOrEqual, "2", 3, false],
  // Sim/Não (resposta boolean, esperado "true"/"false")
  [Operator.Equal, "false", false, true],
  [Operator.NotEqual, "false", false, false],
  [Operator.NotEqual, "false", true, true],
  // Opções (várias)
  [Operator.Contains, "Ônibus", ["Ônibus", "Metrô"], true],
  [Operator.Contains, "Bicicleta", ["Ônibus"], false],
  // Sem resposta: nenhuma condição é atendida
  [Operator.NotEqual, "Não", undefined, false],
  [Operator.NotEqual, "Não", "", false],
  [Operator.Equal, "Sim", null, false],
  [Operator.Contains, "Ônibus", [], false],
];

describe("avaliarCondicaoSimples (tickets-documentacao, 19)", () => {
  it.each(TABELA)(
    "%s %p com resposta %p → %p",
    (operator, expectedValue, resposta, resultado) => {
      const regra = { questionId: "q", operator, expectedValue } as BaseCondition;
      expect(avaliarCondicaoSimples(regra, resposta)).toBe(resultado);
    },
  );
});

describe("avaliarCondicao", () => {
  const regra = (questionId: string, expectedValue: string) =>
    ({ questionId, operator: Operator.Equal, expectedValue }) as BaseCondition;

  it("sem condição, aparece", () => {
    expect(avaliarCondicao(undefined, {})).toBe(true);
  });

  it("E exige todas; OU, alguma", () => {
    const conditions = [regra("a", "1"), regra("b", "2")];
    const respostas = { a: 1, b: 3 };
    expect(avaliarCondicao({ logic: Logic.And, conditions }, respostas)).toBe(false);
    expect(avaliarCondicao({ logic: Logic.Or, conditions }, respostas)).toBe(true);
  });
});
