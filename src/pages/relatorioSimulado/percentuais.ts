import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * O denominador de todos os percentuais desta tabela.
 *
 * ⚠️ **`respondentes`, e não `acertos + erros`.** MEDIDO no ms
 * (`relatorio-simulado-estudante.repository.ts`): `respondentes` conta uma
 * linha de resposta por estudante por questão, e `acertos`, `erros` e
 * `semLeitura` são contados de forma INDEPENDENTE — o próprio docblock de lá
 * diz que derivar um do outro tornaria a invariante verdadeira por construção.
 *
 * Usar `acertos + erros` daria um número mais bonito — e mentiroso, porque
 * esconderia do cálculo quem não foi lido.
 */
function denominador(q: QuestaoDoRelatorio): number {
  return q.respondentes;
}

/**
 * Percentual inteiro, ou `null` quando não há base para calcular.
 *
 * ⚠️ `null`, e nunca `0`. Zero por cento é uma afirmação — "ninguém acertou" —
 * e é diferente de "não há resposta para dividir". A tela mostra travessão no
 * segundo caso, pelo mesmo motivo que o resumo já faz com o aproveitamento.
 */
export function percentual(parte: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((parte / total) * 100);
}

export function percentualDeAcerto(q: QuestaoDoRelatorio): number | null {
  return percentual(q.acertos, denominador(q));
}

/**
 * O complemento do acerto: **quem não acertou**, incluindo quem não foi lido.
 *
 * ⚠️ Decisão do Fernando (2026-10-04): numa questão com 31 respondentes e 1
 * acerto, o `Erro (%)` é 97%, não só a fatia dos erros lidos. A contagem de
 * `Sem leitura` continua na sua coluna, ao lado — o percentual não a esconde,
 * só deixa de tratá-la como uma terceira categoria.
 *
 * ⚠️ `100 − acerto`, e não `(erros + semLeitura) / respondentes` arredondado à
 * parte: dois arredondamentos independentes podem somar 99 ou 101, e a
 * planilha mostraria acerto + erro ≠ 100.
 */
export function percentualDeErro(q: QuestaoDoRelatorio): number | null {
  const acerto = percentualDeAcerto(q);
  return acerto === null ? null : 100 - acerto;
}

/**
 * O percentual de escolha de uma alternativa.
 *
 * ⚠️ Alternativa sem nenhuma marcação vale `0`, não `null`: aqui a base existe
 * (houve respondentes), e "0%" é a informação correta — ninguém marcou aquela
 * letra. O `null` fica reservado para quando não há o que dividir.
 */
export function percentualDaAlternativa(
  q: QuestaoDoRelatorio,
  alternativa: string,
): number | null {
  return percentual(q.porAlternativa[alternativa] ?? 0, denominador(q));
}

/** `null` vira travessão; número vira "42%". */
export function formatarPercentual(valor: number | null): string {
  return valor === null ? "—" : `${valor}%`;
}
