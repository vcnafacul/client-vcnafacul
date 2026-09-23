/**
 * Os textos da linhagem da questão (card 25).
 *
 * ⚠️ **Módulo próprio** pelo mesmo motivo do `posicaoDaDica.ts` (card 19), do
 * `alternativasDaQuestao.ts` (card 11) e do `textoDoAlerta.ts` (card 12): o
 * `react-refresh/only-export-components` reprova função exportada ao lado de
 * componente, e este repo não tolera warning no lint.
 */

export const TEXTO_DUPLICAR = "Duplicar";
export const TEXTO_VER_ORIGINAL = "Ver original";

/**
 * ⚠️ O `title` do botão diz a **consequência na prova**, não a ação. É o que
 * separa duplicar de versionar na cabeça de quem usa (card 27): duplicar não
 * mexe em prova nenhuma — a cópia nasce órfã.
 */
export const TITULO_DUPLICAR =
  "Cria uma questão nova a partir desta. As provas que usam esta questão não mudam.";

/** "3 cópias" / "1 cópia". `null` quando não há nenhuma. */
export function textoDeCopias(quantas: number): string | null {
  if (quantas <= 0) return null;
  return quantas === 1 ? "1 cópia" : `${quantas} cópias`;
}
