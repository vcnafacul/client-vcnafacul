import { AlertTriangle } from "lucide-react";

interface Props {
  /** Quantos estudantes entraram de fato na conta. */
  comDados: number;
  /**
   * Abaixo disto o banner aparece. É `>=` — no limiar exato já não avisa.
   */
  minimo: number;
  /** O que não é representativo. Completa "apenas N aluno(s) com …". */
  descricao: string;
}

/**
 * "Amostra pequena: apenas N aluno(s)…".
 *
 * ⚠️ **Recebe NÚMEROS, e não o `ClassMonthAnalytics`** (card 09). Antes ele
 * lia `monthData.studentsWithAtLeastOneCompletedAttempt` e calculava o próprio
 * limiar (`max(3, 10% do total)`) — uma regra que só faz sentido no agregado
 * mensal da turma. Preso àquele tipo, o relatório de simulado teria de escrever
 * um segundo banner com outro texto para a MESMA situação, e as duas telas
 * passariam a avisar de jeitos diferentes sobre a mesma coisa.
 *
 * Quem sabe qual é o limiar é quem chama: o agregado mensal tem o dele, o
 * histograma do relatório tem o seu (ver `distribuicao.ts`).
 *
 * ⚠️ Não é `print:hidden`: numa folha impressa a ressalva importa ainda mais,
 * porque quem lê não tem como conferir a base em outro lugar.
 */
export function SampleSizeBanner({ comDados, minimo, descricao }: Props) {
  if (comDados >= minimo) return null;

  return (
    <div
      data-testid="sample-size-banner"
      className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Amostra pequena: apenas {comDados} aluno(s) {descricao}. Os dados podem
        não ser representativos.
      </span>
    </div>
  );
}
