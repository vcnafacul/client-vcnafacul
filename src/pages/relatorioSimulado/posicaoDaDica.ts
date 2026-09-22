/**
 * O atraso e o posicionamento da dica dos sinais.
 *
 * ⚠️ **Arquivo próprio**, no padrão de `percentuais.ts` e `segmentosDaBarra.ts`:
 * o `react-refresh/only-export-components` reprova constante e função
 * exportadas ao lado de componente, e o lint deste repo roda com zero warnings.
 *
 * ⚠️ E o posicionamento é puro de propósito — as quatro bordas (cabe acima, não
 * cabe, sai pela esquerda, sai pela direita) se testam com números, sem montar
 * DOM nem medir layout que o jsdom não calcula.
 */
/**
 * Quanto tempo o ponteiro precisa ficar parado antes da dica abrir.
 *
 * ⚠️ **300ms.** O `title` nativo leva ~1s e **não é configurável** — nem por
 * CSS, nem por JS. Um segundo é tempo suficiente para a pessoa concluir que não
 * há tooltip nenhum e seguir em frente.
 *
 * ⚠️ E não zero: sem atraso a dica pisca ao arrastar o ponteiro pela tabela, e
 * cinco badges por linha × 25 linhas viram um estroboscópio.
 */
export const ATRASO_MS = 300;

/** Espaço entre o badge e a caixa. */
const FOLGA = 6;

/** Largura da caixa, em px — casa com o `w-72` que ela usava antes. */
export const LARGURA = 288;

export interface Posicao {
  top: number;
  left: number;
}

/**
 * Onde a caixa cabe, em coordenadas de viewport.
 *
 * ⚠️ **Acima do badge por padrão, abaixo se não couber.** A coluna `Sinais`
 * fica no fim da tabela, e nas primeiras linhas não há espaço acima — a caixa
 * sairia pelo topo da janela.
 *
 * ⚠️ **Alinhada à direita do badge, e presa na borda da janela.** A coluna é a
 * penúltima: uma caixa de 288px crescendo para a direita sairia da tela.
 */
export function posicaoDaDica(
  alvo: DOMRect,
  janela: { largura: number; altura: number },
  altura = 80,
): Posicao {
  const cabeAcima = alvo.top - altura - FOLGA > 0;
  const top = cabeAcima ? alvo.top - altura - FOLGA : alvo.bottom + FOLGA;

  // ⚠️ `Math.max(FOLGA, …)`: em janela estreita o alinhamento à direita jogaria
  // a caixa para fora pela ESQUERDA, trocando um corte por outro.
  const left = Math.max(
    FOLGA,
    Math.min(alvo.right - LARGURA, janela.largura - LARGURA - FOLGA),
  );

  return { top, left };
}
