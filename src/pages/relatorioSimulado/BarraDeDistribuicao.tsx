import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import {
  ALTERNATIVAS,
  CORES_DA_BARRA,
  SEM_LEITURA,
  segmentosDaBarra,
} from "./segmentosDaBarra";

function tituloDaBarra(q: QuestaoDoRelatorio): string {
  const partes = ALTERNATIVAS.map(
    (alt) => `${alt}: ${q.porAlternativa[alt] ?? 0}`,
  );
  return [
    ...partes,
    `sem leitura: ${q.semLeitura}`,
    `de ${q.respondentes} respondentes`,
  ].join(" · ");
}

/**
 * A distribuição de respostas de uma questão, como barra empilhada.
 *
 * ⚠️ **Substitui as cinco colunas `A (%)`…`E (%)`, e isto contradiz uma decisão
 * documentada — de propósito.** O docblock da `TabelaDeQuestoes` separou as
 * alternativas em colunas porque, agrupadas COMO TEXTO (`A 12 B 3 C 2…`), elas
 * "viravam um bloco que não dá para comparar entre linhas nem ordenar". O
 * diagnóstico estava certo; a barra resolve o mesmo problema por outro caminho:
 * **forma compara melhor que dígito**, e uma coluna de barras lida de cima a
 * baixo mostra o distrator que pegou a turma mais rápido do que cinco colunas
 * de percentual — que é literalmente o objetivo daquele docblock.
 *
 * ⚠️ **O que se perde é ordenar por "% que marcou D".** Perda pequena: não é
 * pergunta que alguém faça. O que se ordena de verdade — `% de acerto`, `Base`,
 * `Sem leitura` — continua ordenável.
 *
 * ⚠️ **O que se ganha é largura**, e é a razão de o card 19 vir antes do 05 e do
 * 06: cinco colunas de 5.5rem são 440px, e a barra ocupa 11rem (176px).
 *
 * ⚠️ **Vive em `pages/relatorioSimulado/`, e NÃO no barrel do dashV2** — o
 * docblock dele pede que só entre ali o que duas telas usam.
 */
export function BarraDeDistribuicao({
  questao,
}: {
  questao: QuestaoDoRelatorio;
}) {
  const segmentos = segmentosDaBarra(questao);

  if (segmentos.length === 0) return <span>—</span>;

  const correta = segmentos.find((s) => s.gabarito);

  return (
    <span className="flex items-center gap-2">
      {/*
        ⚠️ `role="img"` + `aria-label`: para quem usa leitor de tela a barra é
        uma imagem com um nome, não seis divs sem sentido. Sem o nome, o leitor
        anuncia "imagem" e o conteúdo fica inalcançável — pior que não marcar.

        ⚠️ O `title` leva as CONTAGENS EXATAS. A barra é a forma; o número
        continua disponível, e é ele que se confere contra a coluna `Base`.
      */}
      <span
        role="img"
        aria-label={`Distribuição das respostas — ${tituloDaBarra(questao)}`}
        title={tituloDaBarra(questao)}
        className={cn(
          "flex h-3 w-full min-w-[6rem] overflow-hidden rounded-sm",
          // ⚠️ Trilho visível: sem ele, uma questão em que a soma NÃO fecha
          // 100% (alternativa fora de A–E — ver o docblock de
          // `porAlternativa`) mostraria uma barra curta sem indicar que falta
          // pedaço.
          CORES_DA_BARRA.semLeitura,
        )}
      >
        {segmentos.map((s) => (
          <span
            key={s.rotulo}
            data-segmento={s.rotulo}
            data-gabarito={s.gabarito ? "" : undefined}
            style={{ width: `${s.fracao * 100}%` }}
            className={cn(
              "h-full",
              s.rotulo === SEM_LEITURA
                ? CORES_DA_BARRA.semLeitura
                : s.gabarito
                  ? CORES_DA_BARRA.gabarito
                  : CORES_DA_BARRA.distrator,
              // ⚠️ A borda é o que marca o gabarito sem depender de cor —
              // `green3` mede 3.77:1 e não passa sozinho.
              s.gabarito && "ring-1 ring-inset ring-marine",
            )}
          />
        ))}
      </span>
      {/*
        ⚠️ **A letra do gabarito ao lado da barra**, e não só dentro dela: um
        segmento de 4% não tem largura para caber texto nenhum, e é justamente
        na questão difícil — onde o gabarito é a fatia MENOR — que saber qual é
        a correta importa mais.
      */}
      {correta !== undefined && (
        <span className="shrink-0 whitespace-nowrap text-xs font-semibold">
          {correta.rotulo} ✓
        </span>
      )}
    </span>
  );
}
