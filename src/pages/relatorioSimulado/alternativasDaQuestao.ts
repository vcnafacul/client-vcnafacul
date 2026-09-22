import type { Question } from "@/dtos/question/questionDTO";

export const LETRAS = ["A", "B", "C", "D", "E"] as const;

/**
 * O texto de cada alternativa, na ordem A–E.
 *
 * ⚠️ **Vive em módulo próprio** pelo mesmo motivo do `posicaoDaDica.ts` do card
 * 19: o `react-refresh/only-export-components` reprova função exportada ao lado
 * de componente, e este repo não tolera warning no lint.
 *
 * ⚠️ **O `?? ""` não é defensivo à toa.** Questão legada não traz os cinco
 * campos, e é o `undefined` deles que distingue "alternativa vazia" de
 * "alternativa que não existe no documento" — quem consome precisa das duas
 * viradas string para poder perguntar se TODAS estão vazias.
 */
export function textosDasAlternativas(q: Question): string[] {
  return [
    q.textoAlternativaA,
    q.textoAlternativaB,
    q.textoAlternativaC,
    q.textoAlternativaD,
    q.textoAlternativaE,
  ].map((t) => t ?? "");
}
