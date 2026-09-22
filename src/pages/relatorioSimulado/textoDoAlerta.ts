/**
 * Os textos derivados do alerta de leitura.
 *
 * ⚠️ **Módulo próprio** pelo mesmo motivo do `posicaoDaDica.ts` (card 19) e do
 * `alternativasDaQuestao.ts` (card 11): `react-refresh/only-export-components`
 * reprova função exportada ao lado de componente, e este repo não tolera
 * warning no lint.
 */

/**
 * ⚠️ **A faixa de percentuais, e não o menor deles.** "Mais de 35%" com uma
 * questão em 35% e outra em 80% é verdadeiro e esconde o caso grave: quem lê
 * precisa saber se o pior é 36% ou 80% para decidir se reimprime a prova.
 */
export function faixaDePercentuais(valores: number[]): string {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return min === max ? `${min}%` : `entre ${min}% e ${max}%`;
}

/**
 * "34, 51 e 52".
 *
 * ⚠️ Questão sem número entra como travessão em vez de sumir: a contagem no
 * começo da frase ("3 questões") tem de bater com o que vem entre parênteses,
 * senão o alerta se contradiz na mesma linha.
 *
 * ⚠️ Vírgulas e um "e" no fim, à mão — mesma decisão (e mesmo motivo) do
 * `explicacaoDaFlag`: `Intl.ListFormat` não está no `lib` do TypeScript deste
 * projeto, e mexer no `tsconfig` por uma lista curta não se paga.
 */
export function listaDeNumeros(numeros: (number | null)[]): string {
  const rotulos = numeros.map((n) => (n === null ? "—" : String(n)));
  if (rotulos.length <= 1) return rotulos.join("");
  return `${rotulos.slice(0, -1).join(", ")} e ${rotulos[rotulos.length - 1]}`;
}
