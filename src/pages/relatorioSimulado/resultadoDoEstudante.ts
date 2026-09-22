import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * "61/90", ou `null` quando não há como montar o par.
 *
 * ⚠️ **Nunca derivado de `aproveitamentoGeral × total`.** O percentual já é uma
 * fração arredondada; multiplicá-la produz `44` onde o aluno fez `45` — e é um
 * número que ele confere à mão contra o próprio cartão. Por isso `acertos` vem
 * contado do servidor, e por isso aqui é `null` quando ele não veio, em vez de
 * um cálculo aproximado.
 *
 * ⚠️ `totalDeQuestoes === 0` também dá `null`: acontece quando o simulado sumiu
 * ou quando o ms ainda não tem o card 08, e "61/0" seria pior que só o
 * percentual.
 */
export function acertosSobreTotal(
  linha: LinhaDoRelatorio,
  totalDeQuestoes: number,
): string | null {
  if (linha.status !== "completed") return null;
  if (typeof linha.acertos !== "number") return null;
  if (totalDeQuestoes <= 0) return null;
  return `${linha.acertos}/${totalDeQuestoes}`;
}

/**
 * A diferença em pontos percentuais entre o aluno e a média do recorte.
 *
 * ⚠️ **Desvio em p.p., e não posição na turma.** Decisão de produto tomada
 * antes de implementar (o card 08 pede explicitamente que seja): esta tela é do
 * coordenador hoje, mas é a base do que um dia vira tela do ALUNO. "12º de 30"
 * responde a mesma pergunta criando um ranking nominal que teria de nascer
 * marcado como "nunca expor"; "+14 p.p." não cria.
 *
 * ⚠️ **Pontos percentuais, não por cento.** 68% contra uma média de 54% é
 * +14 p.p. — e NÃO "+26%", que é a variação relativa e responde outra pergunta.
 * A unidade está no rótulo justamente porque as duas se confundem.
 *
 * ⚠️ `null` quando não há média (ninguém com leitura no recorte) ou quando o
 * aluno não tem nota: sem referência não há desvio, e zero afirmaria "está na
 * média".
 */
export function desvioEmPontos(
  linha: LinhaDoRelatorio,
  mediaDoRecorte: number | null,
): number | null {
  if (linha.status !== "completed") return null;
  if (typeof linha.aproveitamentoGeral !== "number") return null;
  if (mediaDoRecorte === null) return null;
  /*
    ⚠️ Arredonda DEPOIS de subtrair, e sobre a diferença inteira: arredondar os
    dois percentuais antes e subtrair acumula dois erros de meio ponto, e um
    aluno exatamente na média poderia sair com "+1 p.p.".
  */
  return Math.round((linha.aproveitamentoGeral - mediaDoRecorte) * 100);
}

/** "+14 p.p." / "−9 p.p." / "0 p.p." — com o sinal sempre explícito. */
export function formatarDesvio(pontos: number | null): string | null {
  if (pontos === null) return null;
  // ⚠️ Menos tipográfico (U+2212), não hífen: alinha com os dígitos em fonte
  // proporcional, e é o mesmo caractere que o resto da tela usa.
  if (pontos < 0) return `−${Math.abs(pontos)} p.p.`;
  // ⚠️ Sinal explícito no positivo: sem ele "14 p.p." se lê como a nota, não
  // como a diferença.
  return pontos > 0 ? `+${pontos} p.p.` : "0 p.p.";
}
