/*
  ⚠️ O nome não é `navegacaoDaLista.ts`: colide com `NavegacaoDaLista.tsx` em
  sistema de arquivos que não distingue maiúsculas (macOS) — o import do
  componente resolvia para este módulo e vinha `undefined`.
*/

/**
 * "Anterior" e "Próxima" no modal da questão — entre as questões FILTRADAS da
 * listagem, sem fechar o modal.
 *
 * ⚠️ **Atravessa a página.** A listagem é paginada no servidor: na última
 * questão da página, "Próxima" carrega a página seguinte e abre a primeira
 * dela; na primeira, "Anterior" carrega a anterior e abre a última.
 *
 * ⚠️ **A posição é a da questão aberta pela listagem** (a raiz da trilha da
 * linhagem), e não a da cópia/versão por onde a pessoa navegou depois.
 */
export type Passo =
  | { tipo: "mesmaPagina"; indice: number }
  | { tipo: "outraPagina"; pagina: number; abrir: "primeira" | "ultima" };

export function passosDaLista({
  indice,
  pagina,
  limite,
  total,
}: {
  /** Posição na página carregada; -1 = não está na lista. */
  indice: number;
  pagina: number;
  limite: number;
  total: number;
}): { anterior: Passo | null; proxima: Passo | null; posicao: number | null } {
  if (indice < 0) return { anterior: null, proxima: null, posicao: null };
  const posicao = (pagina - 1) * limite + indice; // 0-based, na lista toda
  const naPagina = Math.min(limite, total - (pagina - 1) * limite);

  const anterior: Passo | null =
    posicao <= 0
      ? null
      : indice > 0
        ? { tipo: "mesmaPagina", indice: indice - 1 }
        : { tipo: "outraPagina", pagina: pagina - 1, abrir: "ultima" };
  const proxima: Passo | null =
    posicao >= total - 1
      ? null
      : indice < naPagina - 1
        ? { tipo: "mesmaPagina", indice: indice + 1 }
        : { tipo: "outraPagina", pagina: pagina + 1, abrir: "primeira" };

  return { anterior, proxima, posicao: posicao + 1 };
}
