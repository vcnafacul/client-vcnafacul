/**
 * Os textos da linhagem da questão (card 25).
 *
 * ⚠️ **Módulo próprio** pelo mesmo motivo do `posicaoDaDica.ts` (card 19), do
 * `alternativasDaQuestao.ts` (card 11) e do `textoDoAlerta.ts` (card 12): o
 * `react-refresh/only-export-components` reprova função exportada ao lado de
 * componente, e este repo não tolera warning no lint.
 */

import type { TipoOrigem } from "@/dtos/question/questionDTO";

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

/**
 * O badge de onde a questão veio (card 32).
 *
 * ⚠️ **Uma versão NÃO é "cópia de" nada**: ela substituiu a anterior em todas
 * as provas. Dizer "Cópia de X" numa sucessora era o defeito do card 32.
 *
 * ⚠️ Ausente = cópia, como no ms.
 */
export function textoDaOrigem(
  tipo: TipoOrigem | null | undefined,
  idCurto: string,
): string {
  return tipo === "versao" ? `Substituiu a ${idCurto}` : `Cópia de ${idCurto}`;
}

/** Na questão que foi versionada: quem ficou no lugar dela nas provas. */
export function textoDaSucessora(idCurto: string): string {
  return `Substituída por ${idCurto}`;
}

export const TEXTO_EXCLUIR = "Excluir";
export const TITULO_CONFIRMAR_EXCLUSAO = "Excluir esta questão?";
/**
 * ⚠️ **Diz a consequência que não se vê**: se a questão é cópia ou versão, ela
 * deixa de ser — e isso não volta nem restaurando (card 33).
 */
export const TEXTO_CONFIRMAR_EXCLUSAO =
  "A questão sai do banco de questões. Se ela for cópia ou versão de outra, o vínculo é desfeito e não volta, mesmo que ela seja restaurada.";
