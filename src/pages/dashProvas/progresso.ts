import type { Prova } from "../../dtos/prova/prova";

/**
 * A coluna Progresso: três linhas de `campo: valor` viram uma célula.
 *
 * O card do V1 empilha `Total de Questões`, `Total de Questões Cadastradas` e
 * `Total de Questões Validadas` — três números que só querem dizer alguma coisa
 * comparados entre si, e que ninguém compara entre 40 cards. Aqui viram uma
 * barra de duas faixas mais `validadas/total`, e "quais provas ainda têm questão
 * faltando" passa a ser um clique no cabeçalho.
 *
 * ```
 *  ▓▓▓▓▓▓▓▓▒▒░░░░  132/180
 *  └ verde: validadas
 *    laranja: cadastradas ainda não validadas
 *    cinza: faltando cadastrar
 * ```
 */

/** O que a célula mostra quando não há questão nenhuma para medir. */
export const TEXTO_SEM_QUESTOES = "—";
export const TITULO_SEM_QUESTOES = "Nenhuma questão cadastrada nesta prova";

export interface FaixasDoProgresso {
  /** 0–100. */
  pctValidadas: number;
  /** 0–100, o pedaço laranja **acima** do verde (não inclui as validadas). */
  pctPendentes: number;
}

export type ContagensDaProva = Pick<
  Prova,
  "totalQuestao" | "totalQuestaoCadastradas" | "totalQuestaoValidadas"
>;

/**
 * As duas faixas, em porcentagem — ou `null` quando não há o que medir.
 *
 * ⚠️ **`null` para `totalQuestao === 0`, e é o ponto inteiro desta função.**
 * Existe prova com `totalQuestao: 0` no banco (criada antes do upload do
 * arquivo). O cálculo ingênuo `validadas / (total || 1)` devolve `0/1 = 0` e
 * pintaria a barra vazia — o que já seria discutível — mas a variante que
 * costuma aparecer, `validadas === total ? 100 : ...`, pinta **100%**: uma prova
 * sem uma única questão anunciada como pronta. É o modo de falha que este
 * projeto chama de corrupção silenciosa, e há teste com mutação para ele.
 *
 * ⚠️ Contagens são saneadas antes de virar largura: o banco tem provas com
 * `cadastradas > total` (resquício de re-upload) e uma faixa de 130% escapa do
 * trilho na tela. O `title` mostra os números **crus** — sanear o que se exibe
 * seria esconder o dado inconsistente de quem pode corrigi-lo.
 */
export function faixasDoProgresso(
  prova: ContagensDaProva,
): FaixasDoProgresso | null {
  const total = prova.totalQuestao ?? 0;
  if (total <= 0) return null;

  const validadas = Math.min(Math.max(prova.totalQuestaoValidadas ?? 0, 0), total);
  const cadastradas = Math.min(
    Math.max(prova.totalQuestaoCadastradas ?? 0, validadas),
    total,
  );

  return {
    pctValidadas: (validadas / total) * 100,
    pctPendentes: ((cadastradas - validadas) / total) * 100,
  };
}

/**
 * `sortValue` da coluna.
 *
 * ⚠️ `|| 1` só existe para não dividir por zero; a prova sem questão fica com
 * `0`, que é onde ela pertence numa ordenação por "quanto falta".
 */
export function progressoOrdenavel(prova: ContagensDaProva): number {
  return (prova.totalQuestaoValidadas ?? 0) / (prova.totalQuestao || 1);
}

/** "180 questões · 160 cadastradas · 132 validadas" — números crus. */
export function tituloDoProgresso(prova: ContagensDaProva): string {
  return [
    `${prova.totalQuestao ?? 0} questões`,
    `${prova.totalQuestaoCadastradas ?? 0} cadastradas`,
    `${prova.totalQuestaoValidadas ?? 0} validadas`,
  ].join(" · ");
}
