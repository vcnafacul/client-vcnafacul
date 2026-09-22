import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

export interface PosicaoNaNavegacao {
  /** 1-based, para humano. */
  posicao: number;
  /** Quantos são percorríveis — NÃO é o tamanho do recorte. */
  total: number;
  anterior: LinhaDoRelatorio | null;
  proximo: LinhaDoRelatorio | null;
}

/**
 * Quem o modal percorre com as setas.
 *
 * ⚠️ **Só quem enviou cartão.** Mesma razão de o `onRowClick` não abrir para os
 * outros: não há o que mostrar e a rota devolve 404. O docblock de lá diz que
 * "um clique que só sabe dar erro é pior que um clique que não faz nada" — e
 * vale igual para uma seta que leva a uma tela de erro.
 */
export function navegaveis(linhas: LinhaDoRelatorio[]): LinhaDoRelatorio[] {
  return linhas.filter((l) => l.enviouCartao);
}

/**
 * Onde o aluno aberto está, e quem vem antes e depois.
 *
 * ⚠️ **A ordem é a das linhas VISÍVEIS** — `linhasDaPagina`, já filtradas e
 * ordenadas —, não a do payload. Se a pessoa ordenou por aproveitamento e
 * filtrou por nome, "próximo" tem de significar a próxima linha que ela está
 * vendo; qualquer outra ordem desorienta.
 *
 * ⚠️ **Para no fim da PÁGINA, sem atravessar.** A tabela pagina de 25 em 25, e
 * atravessar exigiria o modal mexer na paginação da tela por baixo — acoplamento
 * novo, para um ganho que o contador honesto já entrega. Por isso `total` é o
 * tamanho da página percorrível, e **não** o do recorte: prometer "3 de 27" e
 * parar no 25 seria pior que dizer "3 de 25".
 *
 * ⚠️ Aluno fora da lista (a página mudou sob o modal aberto) devolve posição 0
 * e as duas pontas nulas — as setas desabilitam em vez de pular para um vizinho
 * que não tem relação com quem está na tela.
 */
export function posicaoNaNavegacao(
  linhas: LinhaDoRelatorio[],
  usuarioAberto: string,
): PosicaoNaNavegacao {
  const lista = navegaveis(linhas);
  const i = lista.findIndex((l) => l.usuario === usuarioAberto);

  if (i === -1) {
    return { posicao: 0, total: lista.length, anterior: null, proximo: null };
  }

  return {
    posicao: i + 1,
    total: lista.length,
    anterior: i > 0 ? lista[i - 1] : null,
    proximo: i < lista.length - 1 ? lista[i + 1] : null,
  };
}
