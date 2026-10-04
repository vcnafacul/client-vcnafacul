import {
  BaseCondition,
  ComplexCondition,
  Logic,
  Operator,
} from "@/types/partnerPrepForm/condition";

/** Resposta ainda não dada: vazio não atende condição nenhuma. */
function semResposta(valor: unknown): boolean {
  return (
    valor === undefined ||
    valor === null ||
    valor === "" ||
    (Array.isArray(valor) && valor.length === 0)
  );
}

/**
 * Uma condição simples (tickets-documentacao, card 19).
 *
 * ⚠️ `expectedValue` é sempre gravado como texto, mas a resposta pode ser
 * número ou booleano. "Igual"/"Diferente" comparam os dois lados como texto:
 * antes o "Diferente" comparava estrito (`3 !== "3"`), e "Diferente de" / "Não
 * é" ficava sempre verdadeiro em Número e Sim/Não.
 *
 * A mesma tabela vale no ms de formulários (`evaluate-conditions.ts`), que
 * decide se a questão é obrigatória — tela e submissão têm de concordar.
 */
export function avaliarCondicaoSimples(
  regra: BaseCondition,
  valor: unknown,
): boolean {
  if (semResposta(valor)) return false;
  const esperado = String(regra.expectedValue);
  switch (regra.operator) {
    case Operator.Equal:
      return String(valor) === esperado;
    case Operator.NotEqual:
      return String(valor) !== esperado;
    case Operator.Contains:
      if (Array.isArray(valor)) return valor.map(String).includes(esperado);
      return String(valor).includes(esperado);
    case Operator.GreaterThan:
      return Number(valor) > Number(regra.expectedValue);
    case Operator.LessThan:
      return Number(valor) < Number(regra.expectedValue);
    case Operator.GreaterThanOrEqual:
      return Number(valor) >= Number(regra.expectedValue);
    case Operator.LessThanOrEqual:
      return Number(valor) <= Number(regra.expectedValue);
    default:
      return false;
  }
}

/** Sem condição, a questão aparece; senão, E/OU das condições simples. */
export function avaliarCondicao(
  condicao: ComplexCondition | undefined,
  respostas: Record<string, unknown>,
): boolean {
  if (!condicao || !condicao.conditions?.length) return true;
  const resultados = condicao.conditions.map((r) =>
    avaliarCondicaoSimples(r, respostas[r.questionId]),
  );
  return condicao.logic === Logic.And
    ? resultados.every(Boolean)
    : resultados.some(Boolean);
}
