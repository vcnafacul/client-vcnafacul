import type { StatusV2 } from "@/components/dashV2";
import type { ResultadoDaQuestao } from "@/dtos/relatorioSimulado/relatorioSimulado";

/**
 * O resultado de uma questão, em tom e rótulo.
 *
 * ⚠️ **Texto, não só cor.** Certo/errado por verde e vermelho sozinhos exclui
 * quem não distingue as duas — e as medições do `tokens.ts` mostram que
 * `green3` (3.77:1) e `red` (3.88:1) sobre branco passam para componente
 * gráfico, **não** para texto pequeno. O rótulo carrega o significado; a cor
 * só acelera a leitura de quem a enxerga.
 *
 * ⚠️ **Três estados, não dois.** Juntar "não marcou" com "marcou errado"
 * distorce exatamente a leitura que o professor faz para decidir o que revisar
 * em aula.
 *
 * ⚠️ Arquivo próprio, e não dentro do `DetalheDoEstudante.tsx`: o
 * `react-refresh/only-export-components` reprova função exportada ao lado de
 * componente, e o `npm run lint` roda com `--max-warnings 0`. Mesmo motivo
 * pelo qual `statusDaLinha` e `voltar` moram sozinhos.
 */
export function rotuloDoResultado(r: ResultadoDaQuestao): {
  texto: string;
  tone: StatusV2;
} {
  switch (r) {
    case "acerto":
      return { texto: "Acertou", tone: "done" };
    case "erro":
      return { texto: "Errou", tone: "missing" };
    default:
      // ⚠️ "Sem leitura", não "em branco": o ms-omr descarta questão em branco
      // e dupla marcação igualmente, então os dois chegam indistinguíveis —
      // "em branco" afirmaria o que ninguém verificou.
      return { texto: "Sem leitura", tone: "neutral" };
  }
}
