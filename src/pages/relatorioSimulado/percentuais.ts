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
 * Com este denominador, acerto% + erro% + semLeitura% fecha 100%, e a coluna
 * "Sem leitura" ao lado explica a diferença. Usar `acertos + erros` daria um
 * número mais bonito — e mentiroso, porque esconderia do cálculo quem não foi
 * lido.
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

export function percentualDeErro(q: QuestaoDoRelatorio): number | null {
  return percentual(q.erros, denominador(q));
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
