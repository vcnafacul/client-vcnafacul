import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { quantil } from "./distribuicao";
import { percentual } from "./percentuais";
import { naoLidas } from "./resultadoDoEstudante";

/**
 * Os limiares do alerta de leitura.
 *
 * ⚠️ **Duas condições, e as duas precisam valer.** Cada uma sozinha erra num
 * sentido diferente, e é a interseção que produz alerta acionável:
 *
 * - **Só relativo** (`k ×` mediana): com 1% de mediana, 4% é quatro vezes a
 *   mediana e não é nada. Acusaria ruído de arredondamento.
 * - **Só absoluto** (piso fixo): um simulado com impressão ruim inteira tem 15%
 *   em tudo, e o corte fixo acusaria as 90 questões. Alerta que aponta tudo não
 *   aponta nada, e a pessoa aprende a ignorá-lo na segunda vez.
 */
export const LIMIARES_DE_LEITURA = {
  /** Quantas vezes a mediana do próprio simulado. */
  fatorSobreMediana: 3,
  /** O piso absoluto, em pontos percentuais. Proposta do card 12. */
  pisoPercentual: 15,
  /**
   * Quantas questões (ou cartões) o recorte precisa ter para a mediana
   * significar alguma coisa.
   *
   * ⚠️ Mesmo 5 do `MINIMO_PARA_DISTRIBUICAO`: abaixo disso a mediana é o
   * próprio outlier na metade dos casos, e o alerta se compararia consigo.
   */
  minimoParaMediana: 5,
  /**
   * Quantos respondentes uma questão precisa ter para o percentual dela valer.
   *
   * ⚠️ **Mesmo 10 do `MINIMO_PARA_DISCRIMINAR` no ms**, e pelo mesmo motivo: com
   * 5 respondentes, UM cartão ilegível dá 20% e cruza o piso sozinho. Chamar
   * isso de "gabarito impresso torto" manda alguém conferir uma folha por causa
   * de uma dobra num cartão.
   */
  minimoDeRespondentes: 10,
} as const;

/** O quanto de uma questão não foi lido, em 0–100. `null` sem base. */
export function percentualSemLeitura(q: QuestaoDoRelatorio): number | null {
  return percentual(q.semLeitura, q.respondentes);
}

/**
 * O quanto de um cartão não foi lido, em 0–100.
 *
 * ⚠️ **`total − respondidas`, sem campo novo no contrato** — é a conta que o
 * card 12 previu: o card 01 fez `questoesRespondidas` passar a existir para
 * cartão, e o 08 trouxe `totalDeQuestoes` no resumo.
 *
 * ⚠️ `null` em quatro casos que NÃO são "leu tudo": leitura não concluída,
 * `questoesRespondidas` ausente (histórico anterior ao card 01), simulado sem
 * total conhecido, e contagem maior que o total (o simulado mudou de tamanho
 * depois da aplicação). Zero afirmaria leitura perfeita em todos eles. As
 * quatro moram no `naoLidas`, em um lugar só.
 */
export function percentualSemLeituraDoCartao(
  linha: LinhaDoRelatorio,
  totalDeQuestoes: number,
): number | null {
  /*
    ⚠️ **A contagem sai do `naoLidas`** (card 13), e não de uma subtração
    escrita aqui: são as MESMAS quatro guardas, e duas cópias delas divergiriam
    no primeiro caso novo — a coluna diria "3 não lidas" e o alerta contaria
    outra coisa sobre o mesmo cartão.
  */
  const quantas = naoLidas(linha, totalDeQuestoes);
  if (quantas === null) return null;
  return percentual(quantas, totalDeQuestoes);
}

/**
 * A mediana de uma lista de percentuais, ou `null` se não há base.
 *
 * ⚠️ Usa o `quantil` do `distribuicao.ts` — o mesmo R-7 do resumo. Uma segunda
 * mediana escrita aqui divergiria dele no primeiro caso de tamanho par, e as
 * duas apareceriam na mesma tela.
 */
function medianaDe(valores: number[]): number | null {
  if (valores.length < LIMIARES_DE_LEITURA.minimoParaMediana) return null;
  return quantil([...valores].sort((a, b) => a - b), 0.5);
}

function estaAnormal(valor: number, mediana: number): boolean {
  return (
    valor >= LIMIARES_DE_LEITURA.pisoPercentual &&
    valor > mediana * LIMIARES_DE_LEITURA.fatorSobreMediana
  );
}

/**
 * Se ESTA questão destoa, dada a mediana já calculada do simulado.
 *
 * ⚠️ **Recebe a mediana pronta, e não a lista.** A flag da linha precisa do
 * veredito por questão, mas o veredito depende do CONJUNTO — e recalcular a
 * mediana dentro de `flagsDaQuestao` faria uma tabela de 180 linhas ordenar 180
 * listas de 180 a cada render. Quem tem a lista calcula uma vez; quem tem a
 * linha recebe o número.
 *
 * ⚠️ `mediana === null` é "não avaliado", e devolve `false` — nunca flag a
 * partir de base que o próprio módulo recusou.
 */
export function leituraAnormalDaQuestao(
  q: QuestaoDoRelatorio,
  mediana: number | null,
): boolean {
  if (mediana === null) return false;
  if (q.respondentes < LIMIARES_DE_LEITURA.minimoDeRespondentes) return false;
  const p = percentualSemLeitura(q);
  return p !== null && estaAnormal(p, mediana);
}

export interface LeituraAnormalDasQuestoes {
  /** As questões fora do padrão, na ordem em que vieram. */
  questoes: QuestaoDoRelatorio[];
  /** A mediana contra a qual elas foram comparadas. `null` = não avaliado. */
  mediana: number | null;
}

/**
 * As questões cujo "sem leitura" destoa do próprio simulado.
 *
 * Uma questão com 40% sem leitura enquanto as outras têm 2% não é 40% da turma
 * deixando a MESMA questão em branco por coincidência — é a linha do gabarito
 * impressa torta, ou fora de margem. E o defeito invalida os outros números
 * daquela linha: o `% de acerto` dela está calculado sobre uma base que não
 * representa a turma.
 *
 * ⚠️ **A mediana é de TODAS as questões com base**, inclusive as que vão virar
 * alerta. Tirá-las antes seria comparar o outlier com um simulado do qual ele
 * foi removido — o que baixa a mediana e faz o alerta crescer sozinho.
 */
export function questoesComLeituraAnormal(
  questoes: QuestaoDoRelatorio[],
): LeituraAnormalDasQuestoes {
  const comBase = questoes.filter(
    (q) => q.respondentes >= LIMIARES_DE_LEITURA.minimoDeRespondentes,
  );
  const percentuais = comBase
    .map(percentualSemLeitura)
    .filter((p): p is number => p !== null);

  const mediana = medianaDe(percentuais);
  if (mediana === null) return { questoes: [], mediana: null };

  return {
    mediana,
    questoes: comBase.filter((q) => {
      const p = percentualSemLeitura(q);
      return p !== null && estaAnormal(p, mediana);
    }),
  };
}

export interface CartaoComLeituraAnormal {
  linha: LinhaDoRelatorio;
  /** O percentual do cartão — o que o alerta mostra ao lado do nome. */
  percentual: number;
}

export interface LeituraAnormalDosCartoes {
  cartoes: CartaoComLeituraAnormal[];
  mediana: number | null;
}

/**
 * Os cartões cuja leitura destoa dos demais do mesmo recorte.
 *
 * Um cartão com 30% sem leitura enquanto os outros têm 1% é foto ruim ou folha
 * amassada — e o aluno está com nota artificialmente baixa até alguém notar.
 *
 * ⚠️ **Este é o caso que hoje não entra em fila nenhuma.** O status dele é
 * "Lido": não falhou, não está processando, não aparece em nenhum filtro de
 * problema. É por isso que o alerta precisa levar ao reenvio, e não só informar.
 */
export function cartoesComLeituraAnormal(
  linhas: LinhaDoRelatorio[],
  totalDeQuestoes: number,
): LeituraAnormalDosCartoes {
  const comPercentual = linhas
    .map((linha) => ({
      linha,
      percentual: percentualSemLeituraDoCartao(linha, totalDeQuestoes),
    }))
    .filter((c): c is CartaoComLeituraAnormal => c.percentual !== null);

  const mediana = medianaDe(comPercentual.map((c) => c.percentual));
  if (mediana === null) return { cartoes: [], mediana: null };

  return {
    mediana,
    cartoes: comPercentual.filter((c) => estaAnormal(c.percentual, mediana)),
  };
}
