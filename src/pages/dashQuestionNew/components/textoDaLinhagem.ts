/**
 * Os textos da linhagem da questão (card 25).
 *
 * ⚠️ **Módulo próprio** pelo mesmo motivo do `posicaoDaDica.ts` (card 19), do
 * `alternativasDaQuestao.ts` (card 11) e do `textoDoAlerta.ts` (card 12): o
 * `react-refresh/only-export-components` reprova função exportada ao lado de
 * componente, e este repo não tolera warning no lint.
 */

export const TEXTO_DUPLICAR = "Duplicar";
/**
 * ⚠️ O `title` do botão diz a **consequência na prova**, não a ação. É o que
 * separa duplicar de versionar na cabeça de quem usa (card 27): duplicar não
 * mexe em prova nenhuma — a cópia nasce órfã.
 */
export const TITULO_DUPLICAR =
  "Cria uma questão nova a partir desta. As provas que usam esta questão não mudam.";

/** "Versão 2 de 3" — o lugar da questão na cadeia (card 34A). */
export function textoDaPosicao(posicao: number, total: number): string {
  return `Versão ${posicao} de ${total}`;
}

/** O rótulo do alternador: "Cópias (3)". */
export function textoDoAlternador(
  rotulo: "Versões" | "Cópias",
  quantas: number,
): string {
  return quantas > 0 ? `${rotulo} (${quantas})` : rotulo;
}

export const TEXTO_SEM_LINHAGEM =
  "Esta questão não tem versões nem cópias.";
export const TEXTO_SEM_VERSOES =
  "Esta questão nunca foi versionada. Uma nova versão nasce ao editar o conteúdo de uma questão já respondida.";
export const TEXTO_SEM_COPIAS = "Ninguém duplicou esta questão.";
export const TEXTO_VOLTAR = "← voltar";

/** Pendente / Aprovada / Rejeitada — `StatusEnum` do banco de questões. */
export function rotuloDoStatus(status: number): string {
  return status === 1 ? "Aprovada" : status === 2 ? "Rejeitada" : "Pendente";
}

/** "em 2 provas" / "em 1 prova" / "em nenhuma prova". */
export function textoDasProvas(n: number): string {
  if (n <= 0) return "em nenhuma prova";
  return n === 1 ? "em 1 prova" : `em ${n} provas`;
}

export const TEXTO_EXCLUIR = "Excluir";
export const TITULO_CONFIRMAR_EXCLUSAO = "Excluir esta questão?";
/**
 * ⚠️ **Diz a consequência que não se vê**: se a questão é cópia ou versão, ela
 * deixa de ser — e isso não volta nem restaurando (card 33).
 */
export const TEXTO_CONFIRMAR_EXCLUSAO =
  "A questão sai do banco de questões. Se ela for cópia ou versão de outra, o vínculo é desfeito e não volta, mesmo que ela seja restaurada.";
