import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import type { FaixaDoHistograma } from "./distribuicao";
import { DicaRapida } from "./DicaRapida";

/**
 * A distribuição dos acertos, como barras.
 *
 * ⚠️ **`div`s com `height: %`, e NÃO `@nivo/bar`.** O projeto tem nivo (o
 * `classSimuladoAnalytics` usa), mas trazer um `<ResponsiveBar>` para desenhar
 * oito barras sem eixo, sem tooltip e sem legenda é peso de bundle e de API por
 * um elemento que não precisa de nenhuma das três. É uma sparkline, não um
 * gráfico.
 *
 * ⚠️ **NÃO é `print:hidden`**, ao contrário dos controles da tela: o histograma
 * é conteúdo, e é a coisa mais útil da folha impressa — a pergunta "a turma é
 * bimodal?" se responde de relance por ele e por nenhum número.
 *
 * ⚠️ **Rótulo textual em cada barra**, via `title`: a forma é a leitura rápida,
 * mas quem usa leitor de tela e quem precisa do número exato têm de chegar
 * neles. O `role="img"` com `aria-label` dá o resumo inteiro de uma vez.
 */
export function HistogramaDaTurma({
  faixas,
  base,
}: {
  faixas: FaixaDoHistograma[];
  base: number;
}) {
  if (faixas.length === 0) return null;

  /*
    ⚠️ A altura é relativa ao MAIOR balde, não à base: com 30 alunos espalhados
    em oito faixas, nenhuma barra passaria de 20% da altura e o gráfico viraria
    uma linha rasteira. O que se lê aqui é a FORMA, e forma é relativa.
  */
  const maior = Math.max(...faixas.map((f) => f.quantos));

  const resumo = faixas
    .filter((f) => f.quantos > 0)
    .map((f) => `${f.de}–${f.ate}: ${f.quantos}`)
    .join(" · ");

  return (
    <div
      data-testid="histograma-da-turma"
      role="img"
      aria-label={`Distribuição dos acertos de ${base} estudantes — ${resumo}`}
      className="flex h-10 items-end gap-0.5"
    >
      {faixas.map((f) => (
        // ⚠️ `flex-1 h-full` no wrapper, pelo mesmo motivo da barra: ele entra
        // no layout, e as oito faixas dependem de dividir a largura por igual.
        <DicaRapida
          key={f.de}
          texto={`${f.de} a ${f.ate} acertos: ${f.quantos} estudante(s)`}
          className="h-full flex-1"
        >
        <span
          data-faixa={`${f.de}-${f.ate}`}
          className="flex h-full flex-1 items-end"
        >
          <span
            className={cn("w-full rounded-sm", dashV2.progress.done)}
            /*
              ⚠️ Altura mínima visível para balde NÃO vazio: uma barra de 1 em
              30 daria 3% e sumiria, e "ninguém nessa faixa" é diferente de
              "um, mas pouco". Balde vazio fica com altura zero mesmo.
            */
            style={{
              height:
                f.quantos === 0
                  ? 0
                  : `${Math.max(8, (f.quantos / maior) * 100)}%`,
            }}
          />
        </span>
        </DicaRapida>
      ))}
    </div>
  );
}
