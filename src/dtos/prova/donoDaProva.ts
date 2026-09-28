/**
 * De quem é a prova e se quem está logado pode mexer na composição dela
 * (tickets/023, card 07). Vem do ms, calculado com o ator da requisição —
 * ⚠️ a tela NÃO recalcula, só reflete.
 *
 * Tudo opcional: uma api antiga não manda, e aí a tela se comporta como antes.
 */
export interface DonoDaProva {
  cursinhoId?: string | null;
  /** O nome do cursinho dono (a api resolve). */
  cursinhoNome?: string | null;
  /** Categoria da plataforma ou fora de uso: prova oficial. */
  protegida?: boolean;
  /** `false` = categoria fora de uso — área/frente1 só pelo projeto (card 17). */
  selecionavel?: boolean;
  receberNovasVersoes?: boolean;
  podeComporProva?: boolean;
}
