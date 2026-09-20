/**
 * O que o relatório carrega para saber voltar.
 *
 * ⚠️ Não existe arte prévia de `location.state` neste repo — este é o primeiro
 * uso. O contrato mora aqui, e não inline nos dois lados, para as duas pontas
 * não divergirem em silêncio.
 */

/** Os cinco filtros da listagem de provas, do jeito que ela os restaura. */
export interface FiltrosDaListagem {
  nome: string;
  edicao: string;
  aplicacao: string;
  ano: string;
  gabaritoOnly: boolean;
}

/** O `de` da listagem de provas: caminho **mais** tudo o que ela remonta. */
export interface VoltaParaListagem {
  caminho: string;
  filtros: FiltrosDaListagem;
  /** Qual prova reabrir no `ShowProva`. */
  provaId: string;
  /** Em que página da listagem a pessoa estava. */
  pagina: number;
}

/**
 * Para onde voltar, e — quando há — o que restaurar ao chegar.
 *
 * ⚠️ **União, não três opcionais soltos.** Há duas entradas para o relatório:
 * a listagem de provas, que restaura filtros, prova e página; e a tela de
 * turma, que não tem nada disso para restaurar. Com três campos opcionais
 * independentes, um call site da listagem que esquecesse `pagina` compilaria
 * e degradaria calado. Assim os três viajam juntos ou nenhum viaja, e quem
 * garante isso é o compilador.
 *
 * ⚠️ `react-router` 7.13.1 tipa `NavigateOptions.state` como `any` — o que
 * segura a forma é a anotação no call site (`const deAqui: EstadoDeVolta`).
 * Por isso ela existe nos três, e por isso a união precisa fechar a brecha que
 * o `any` deixa aberta.
 */
export type EstadoDeVolta = { caminho: string } & (
  | Omit<VoltaParaListagem, "caminho">
  | { filtros?: never; provaId?: never; pagina?: never }
);

export interface LocationStateDoRelatorio {
  de?: EstadoDeVolta;
}
