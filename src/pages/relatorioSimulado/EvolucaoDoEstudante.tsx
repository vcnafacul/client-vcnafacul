import { dashV2 } from "@/components/dashV2";
import type { PontoDaSerie } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import {
  MINIMO_PARA_SERIE,
  pontosDesenhados,
  textoDaVariacao,
} from "./serieDoEstudante";

export const TEXTO_UMA_APLICACAO =
  "Este é o primeiro simulado deste estudante no recorte. A evolução aparece a partir da segunda aplicação.";
export const TEXTO_SEM_APLICACAO =
  "Nenhuma aplicação com leitura concluída neste recorte.";

const ALTURA = 120;
const LARGURA = 320;
/** Folga para o ponto não encostar na borda do `viewBox`. */
const FOLGA = 8;

function coordenada(x: number, y: number): { cx: number; cy: number } {
  return {
    cx: FOLGA + x * (LARGURA - 2 * FOLGA),
    // ⚠️ SVG cresce para BAIXO: `1 - y` é o que põe 100% no topo.
    cy: FOLGA + (1 - y) * (ALTURA - 2 * FOLGA),
  };
}

function caminho(
  pontos: { x: number; y: number | null }[],
): string {
  /*
    ⚠️ **`M` a cada retomada, e não uma linha contínua** (card 17): quando o
    recorte não tem média num ponto, o traço da turma FALHA ali. Ligar os dois
    vizinhos desenharia uma reta que atravessa a lacuna — e quem olha lê isso
    como "a turma manteve", que é uma afirmação sobre um dado que não existe.
  */
  let d = "";
  let desenhando = false;
  for (const p of pontos) {
    if (p.y === null) {
      desenhando = false;
      continue;
    }
    const { cx, cy } = coordenada(p.x, p.y);
    d += `${desenhando ? "L" : "M"}${cx.toFixed(1)} ${cy.toFixed(1)} `;
    desenhando = true;
  }
  return d.trim();
}

/**
 * A série de aplicações de um estudante (card 17, degrau 2).
 *
 * ⚠️ **As DUAS linhas, sempre — nunca a do aluno sozinha.** Dois simulados de
 * dificuldade diferente não se comparam por percentual bruto: cair de 62% para
 * 55% pode ser MELHORA, se o segundo foi muito mais difícil. A linha do aluno
 * sozinha é o gráfico que mais convida à conclusão errada, e é o padrão em
 * quase toda plataforma de simulado.
 *
 * ⚠️ **SVG à mão, e não uma biblioteca de gráfico.** São duas polilinhas de no
 * máximo uma dúzia de pontos; o `@nivo` que o `classSimuladoAnalytics` usa
 * custaria o bundle inteiro dele dentro de um modal — mesma decisão (e mesmo
 * motivo) do `HistogramaDaTurma` no card 09.
 *
 * ⚠️ **O eixo Y é 0–100% fixo.** Escalar ao mínimo e máximo do aluno
 * transformaria uma variação de 2 pontos num gráfico dramático — o truque
 * clássico de gráfico enganoso, e aqui ele mentiria para quem vai conversar com
 * a família.
 */
export function EvolucaoDoEstudante({ pontos }: { pontos: PontoDaSerie[] }) {
  if (pontos.length === 0) {
    return (
      <p data-evolucao-vazia className={cn("text-xs", dashV2.text.muted)}>
        {TEXTO_SEM_APLICACAO}
      </p>
    );
  }

  /*
    ⚠️ **Um ponto NÃO vira gráfico**, e a frase diz por quê. Um eixo com uma
    bolinha sugere tendência onde não há nenhuma — e o card é explícito: "aluno
    com uma aplicação só mostra um ponto e uma explicação, não um gráfico
    vazio".
  */
  if (pontos.length < MINIMO_PARA_SERIE) {
    return (
      <div data-evolucao-unica className="flex flex-col gap-1">
        <p className={cn("text-sm", dashV2.text.primary)}>
          {pontos[0].nome ?? "Simulado"} ·{" "}
          {Math.round(pontos[0].aproveitamento * 100)}%
        </p>
        <p className={cn("text-xs", dashV2.text.muted)}>
          {TEXTO_UMA_APLICACAO}
        </p>
      </div>
    );
  }

  const desenhados = pontosDesenhados(pontos);
  const dAluno = caminho(desenhados.map((p) => ({ x: p.x, y: p.yAluno })));
  const dTurma = caminho(desenhados.map((p) => ({ x: p.x, y: p.yTurma })));

  return (
    <section data-evolucao className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="h-32 w-full"
        role="img"
        /*
          ⚠️ O resumo textual É a acessibilidade aqui. Um `<svg>` de polilinhas
          não diz nada a leitor de tela, e a frase abaixo do gráfico carrega a
          mesma informação — por isso ela também vira o rótulo.
        */
        aria-label={textoDaVariacao(pontos) ?? undefined}
      >
        {/* ⚠️ A linha da turma vai ATRÁS: a do aluno é o assunto. */}
        <path
          data-linha-turma
          d={dTurma}
          fill="none"
          strokeWidth={2}
          strokeDasharray="4 3"
          className="stroke-gray-400"
        />
        <path
          data-linha-aluno
          d={dAluno}
          fill="none"
          strokeWidth={2}
          className="stroke-orange"
        />
        {desenhados.map((p) => {
          const { cx, cy } = coordenada(p.x, p.yAluno);
          return (
            <circle
              key={p.ponto.simuladoId}
              data-ponto={p.ponto.simuladoId}
              cx={cx}
              cy={cy}
              r={3}
              className="fill-orange"
            >
              {/*
                ⚠️ `<title>` dentro do `<circle>` é o tooltip nativo do SVG — e
                aqui ele serve, ao contrário do caso do card 06: não há Radix
                envolvido, não há atraso relevante numa dúzia de pontos, e o
                texto é curto.
              */}
              <title>
                {p.ponto.nome ?? "Simulado"}:{" "}
                {Math.round(p.ponto.aproveitamento * 100)}%
                {p.ponto.mediaDoRecorte !== null &&
                  ` · turma ${Math.round(p.ponto.mediaDoRecorte * 100)}% (${
                    p.ponto.baseDoRecorte
                  })`}
              </title>
            </circle>
          );
        })}
      </svg>

      {/*
        ⚠️ **A frase existe porque o gráfico não diz "melhorou".** Um aluno que
        caiu 7 numa turma que caiu 10 SUBIU de posição, e ler isso do desenho
        exige comparar duas inclinações de cabeça.
      */}
      <p data-variacao className={cn("text-xs", dashV2.text.secondary)}>
        {textoDaVariacao(pontos)}
      </p>

      <p className={cn("text-xs", dashV2.text.muted)}>
        A linha tracejada é a média do recorte em cada aplicação.
      </p>
    </section>
  );
}
