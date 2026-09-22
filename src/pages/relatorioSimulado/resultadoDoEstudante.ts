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

/**
 * Quantas questões do cartão não saíram com marcação legível.
 *
 * ⚠️ **A decisão do card 13 é a opção C: a fórmula do aproveitamento NÃO muda —
 * o que muda é a tela dizer o que o número esconde.**
 *
 * `criaAproveitamento` divide por `respostas.length`, ou seja, questão não lida
 * conta como erro. Isso contradizia a regra que o relatório inteiro respeita em
 * cinco lugares ("sem leitura" ≠ "errou"), e a contradição estava justamente no
 * único número que o coordenador olha.
 *
 * ⚠️ **Mas mudar para `acertos / lidas` (opção B) é pior, por dois motivos
 * medidos:**
 *
 * 1. A nota do aluno **melhoraria quando a leitura do cartão dele piorasse** —
 *    o incentivo exatamente invertido. E dois alunos com 90 e 60 lidas passariam
 *    a ter notas em bases diferentes, com a média da turma somando coisas
 *    incomparáveis.
 * 2. O valor está **gravado** no histórico. Mudar a fórmula só afeta históricos
 *    novos, então o radar do `classSimuladoAnalytics` teria meses calculados de
 *    dois jeitos e nada na tela diria isso.
 *
 * ⚠️ E o que decidiria entre A e B — separar "deixou em branco" de "o OMR não
 * leu" — **não existe nos dados**: o `ms-omr` descarta os dois igualmente. Não
 * dá para escolher a fórmula certa; dá para mostrar a ambiguidade.
 *
 * ⚠️ **Derivado, e não campo novo no contrato.** `questoesRespondidas` (card 01)
 * e `totalDeQuestoes` (card 08) já viajam; um `naoLidas` ao lado seria o mesmo
 * dado numa terceira forma, com uma chance a mais de divergir.
 *
 * `null` — e nunca `0` — em tudo que não é leitura concluída com contagem
 * conhecida: `0` afirmaria "leu o cartão inteiro".
 */
export function naoLidas(
  linha: LinhaDoRelatorio,
  totalDeQuestoes: number,
): number | null {
  if (linha.status !== "completed") return null;
  if (typeof linha.questoesRespondidas !== "number") return null;
  if (totalDeQuestoes <= 0) return null;
  /*
    ⚠️ Maior que o total = o simulado encolheu depois da aplicação. Um número
    negativo passaria pelo `> 0` da tela e sumiria; `null` diz que não se sabe.
  */
  if (linha.questoesRespondidas > totalDeQuestoes) return null;
  return totalDeQuestoes - linha.questoesRespondidas;
}

/** "3 não lidas" / "1 não lida". `null` quando não há o que dizer. */
export function textoDeNaoLidas(quantas: number | null): string | null {
  // ⚠️ Zero não vira texto: anotar "0 não lidas" em 300 linhas é ruído, e o
  // card pede explicitamente só quando > 0.
  if (quantas === null || quantas <= 0) return null;
  return quantas === 1 ? "1 não lida" : `${quantas} não lidas`;
}
