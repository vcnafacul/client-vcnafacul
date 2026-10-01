import { HistoricoDTO } from "@/dtos/historico/historicoDTO";

/**
 * Simulado feito no papel e corrigido pelo cartão-resposta. Não tem tempo
 * cronometrado — `tempoRealizado` não significa nada nele.
 */
export function foiPorCartao(historico: Pick<HistoricoDTO, "cartaoCode">) {
  return !!historico.cartaoCode;
}
