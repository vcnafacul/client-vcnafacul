/**
 * O que o relatório carrega para saber voltar.
 *
 * ⚠️ Não existe arte prévia de `location.state` neste repo — este é o primeiro
 * uso. O contrato mora aqui, e não inline nos dois lados, para as duas pontas
 * não divergirem em silêncio.
 */
export interface EstadoDeVolta {
  /** Para onde voltar. */
  caminho: string;
  /** Os filtros da listagem, para re-semear. */
  filtros: {
    nome: string;
    edicao: string;
    aplicacao: string;
    ano: string;
    gabaritoOnly: boolean;
  };
  /** Qual prova reabrir no `ShowProva`. */
  provaId: string;
  /** Em que página da listagem a pessoa estava. */
  pagina: number;
}

export interface LocationStateDoRelatorio {
  de?: EstadoDeVolta;
}
