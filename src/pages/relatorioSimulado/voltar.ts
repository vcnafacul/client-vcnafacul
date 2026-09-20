/**
 * O que o relatório carrega para saber voltar.
 *
 * ⚠️ Não existe arte prévia de `location.state` neste repo — este é o primeiro
 * uso. O contrato mora aqui, e não inline nos dois lados, para as duas pontas
 * não divergirem em silêncio.
 */
export interface EstadoDeVolta {
  /** Para onde voltar. **Só isto é obrigatório.** */
  caminho: string;
  /**
   * O resto é da listagem de provas, e é opcional porque há **duas** entradas
   * para o relatório.
   *
   * ⚠️ Quem vem da **tela de turma** manda só o `caminho`: não há filtro,
   * prova nem página para restaurar, e exigir campos inventados só para
   * satisfazer o tipo faria a tela mentir sobre o que ela sabe.
   *
   * ⚠️ E opcional **não** quer dizer que a listagem de provas possa restaurar
   * pela metade: lá os três andam juntos, e a guarda explícita que garante
   * isso mora na `partnerPrepProvas` — o tipo sozinho não a impõe mais.
   */
  filtros?: {
    nome: string;
    edicao: string;
    aplicacao: string;
    ano: string;
    gabaritoOnly: boolean;
  };
  /** Qual prova reabrir no `ShowProva`. */
  provaId?: string;
  /** Em que página da listagem a pessoa estava. */
  pagina?: number;
}

export interface LocationStateDoRelatorio {
  de?: EstadoDeVolta;
}
