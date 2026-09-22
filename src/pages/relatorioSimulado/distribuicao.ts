import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * Abaixo disto, nenhuma estatística de dispersão — travessão.
 *
 * ⚠️ Mediana de 2 alunos é uma afirmação sem conteúdo, e Q1–Q3 de 3 também.
 * Mesmo princípio do `MINIMO_PARA_DISCRIMINAR` do ms e do `desviosPorMateria`:
 * número com cara de estatística sobre base minúscula engana mais do que
 * informa, porque quem lê não tem como saber da base olhando o número.
 *
 * O `comLeituraConcluida` fica ao lado no resumo justamente para a base ser
 * julgável.
 */
export const MINIMO_PARA_DISTRIBUICAO = 5;

/**
 * Abaixo disto o histograma não é desenhado.
 *
 * ⚠️ Maior que o mínimo das estatísticas, de propósito: quatro barras de
 * altura 1 **parecem** uma distribuição, e é justamente a forma que a pessoa lê
 * de relance sem conferir a base. Um número ruim ela questiona; um gráfico
 * ruim ela acredita.
 */
export const MINIMO_PARA_HISTOGRAMA = 8;

/** Quantas faixas o histograma tem. */
export const FAIXAS_DO_HISTOGRAMA = 8;

export interface Distribuicao {
  /** Quantos entraram na conta — o mesmo conjunto do "Aproveitamento médio". */
  base: number;
  /** Em acertos absolutos. `null` abaixo do mínimo. */
  mediana: number | null;
  minimo: number | null;
  maximo: number | null;
  /** Primeiro e terceiro quartis — a metade do meio da turma. */
  q1: number | null;
  q3: number | null;
}

export interface FaixaDoHistograma {
  /** Limites em acertos, ambos inclusivos. */
  de: number;
  ate: number;
  /** Quantos estudantes caíram nesta faixa. */
  quantos: number;
}

/**
 * Os acertos de quem entrou na média, em ordem crescente.
 *
 * ⚠️ **O mesmo conjunto do "Aproveitamento médio"**: linhas `completed` com
 * nota. Se a distribuição usasse outro conjunto, a mediana e a média do resumo
 * falariam de turmas diferentes — e quem lê as duas lado a lado não teria como
 * saber.
 *
 * ⚠️ **Em ACERTOS, não em percentual** (card 09). "45–54 acertos" é mais
 * legível que "50–60%" para quem compara com nota de corte, e é a unidade em
 * que o cursinho conversa. Quem não tem `acertos` (histórico anterior ao card
 * 08) fica de fora — e a base ao lado denuncia.
 */
function acertosOrdenados(linhas: LinhaDoRelatorio[]): number[] {
  return linhas
    .filter((l) => l.status === "completed" && typeof l.acertos === "number")
    .map((l) => l.acertos as number)
    .sort((a, b) => a - b);
}

/**
 * O quantil pela interpolação linear entre posições — o método R-7, que é o
 * padrão do `quantile()` do R, do `numpy.percentile` e do `PERCENTIL.INC` do
 * Excel.
 *
 * ⚠️ **Interpola, e não escolhe o vizinho.** Com 4 alunos em 10/20/30/40, o Q1
 * "vizinho mais próximo" seria 20 e o interpolado é 17,5 — e o segundo é o que
 * bate com o que o coordenador vê se refizer a conta na planilha. Divergir do
 * Excel num número que alguém vai conferir lá é criar uma discussão que não
 * precisa existir.
 */
function quantil(ordenados: number[], p: number): number {
  const posicao = (ordenados.length - 1) * p;
  const abaixo = Math.floor(posicao);
  const acima = Math.ceil(posicao);
  if (abaixo === acima) return ordenados[abaixo];
  const peso = posicao - abaixo;
  return ordenados[abaixo] * (1 - peso) + ordenados[acima] * peso;
}

/**
 * A distribuição dos acertos da turma.
 *
 * ⚠️ **Média sozinha esconde a turma bimodal**, que é o caso comum em cursinho.
 * Dois cenários com a mesma média de 58%: todo mundo entre 54% e 62% (dá para
 * dar a mesma aula) ou metade em 35% e metade em 80% (duas turmas dentro de
 * uma). São decisões pedagógicas opostas, e o resumo mostrava o mesmo número.
 *
 * ⚠️ **Quartis, e não desvio-padrão.** Desvio-padrão pressupõe distribuição
 * simétrica — exatamente o que este cálculo existe para NÃO pressupor. "A
 * metade do meio da turma ficou entre 44 e 71 acertos" se lê direto e não mente
 * em turma bimodal.
 *
 * ⚠️ Tudo `null` abaixo do mínimo, nunca zero — o relatório inteiro é rigoroso
 * sobre não afirmar o que não mediu, e a média sem dispersão era o ponto em que
 * a tela afirmava mais do que sabia.
 */
export function distribuicaoDaTurma(linhas: LinhaDoRelatorio[]): Distribuicao {
  const acertos = acertosOrdenados(linhas);
  const base = acertos.length;

  if (base < MINIMO_PARA_DISTRIBUICAO) {
    return { base, mediana: null, minimo: null, maximo: null, q1: null, q3: null };
  }

  return {
    base,
    mediana: quantil(acertos, 0.5),
    minimo: acertos[0],
    maximo: acertos[base - 1],
    q1: quantil(acertos, 0.25),
    q3: quantil(acertos, 0.75),
  };
}

/**
 * As faixas do histograma, em acertos.
 *
 * ⚠️ **As faixas cobrem 0 até `totalDeQuestoes`**, e não mín–máx: o eixo tem de
 * ser o mesmo entre dois simulados do mesmo tamanho, senão duas turmas com
 * distribuições diferentes desenham barras iguais. E uma turma toda entre 40 e
 * 45 acertos precisa parecer concentrada à direita, não espalhada.
 *
 * ⚠️ **Lista vazia abaixo do mínimo**, e o chamador mostra o banner. Quatro
 * barras de altura 1 parecem distribuição.
 */
export function faixasDoHistograma(
  linhas: LinhaDoRelatorio[],
  totalDeQuestoes: number,
): FaixaDoHistograma[] {
  const acertos = acertosOrdenados(linhas);
  if (acertos.length < MINIMO_PARA_HISTOGRAMA) return [];
  if (totalDeQuestoes <= 0) return [];

  const tamanho = totalDeQuestoes / FAIXAS_DO_HISTOGRAMA;

  return Array.from({ length: FAIXAS_DO_HISTOGRAMA }, (_, i) => {
    const de = Math.round(i * tamanho);
    /*
      ⚠️ `- 1` porque os limites são INCLUSIVOS nos dois lados: sem isso a
      faixa 0 iria até 11 e a faixa 1 começaria em 11, e quem fez 11 seria
      contado duas vezes. A última faixa fecha no total exato.
    */
    const ate =
      i === FAIXAS_DO_HISTOGRAMA - 1
        ? totalDeQuestoes
        : Math.round((i + 1) * tamanho) - 1;

    /*
      ⚠️ **A última faixa não tem teto**, e isso é proteção, não estética: se um
      registro vier com `acertos > totalDeQuestoes` (dado inconsistente — a
      invariante do ms diz que não acontece, mas ela vale para o que o ms
      grava, não para o que já está gravado), ele sumiria do histograma em
      silêncio e a soma das barras deixaria de bater com a base ao lado.

      Sem teto, ele aparece na última barra: visível e conferível, em vez de
      desaparecido. Foi um fixture meu com 85 acertos em 80 questões que expôs
      isso — o teste da soma falhou, e o caso era real o bastante para tratar.
    */
    const ultima = i === FAIXAS_DO_HISTOGRAMA - 1;

    return {
      de,
      ate,
      quantos: acertos.filter((a) => a >= de && (ultima || a <= ate)).length,
    };
  });
}
