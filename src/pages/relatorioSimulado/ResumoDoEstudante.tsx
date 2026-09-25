import { dashV2 } from "@/components/dashV2";
import {
  frentesSomamMais,
  TEXTO_FRENTES_SOMAM_MAIS,
} from "./frentesSomamMais";
import type {
  LinhaDoRelatorio,
  MediaPorMateria,
  RespostaDoEstudante,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  acertosSobreTotal,
  desvioEmPontos,
  formatarDesvio,
} from "./resultadoDoEstudante";

const VAZIO = "—";

/** A linha de uma matéria, com a barra e a média da turma ao lado. */
/**
 * "de 12 questões", ou nada.
 *
 * ⚠️ **Nada, e nunca "de 0 questões"** (card 30): histórico gravado antes
 * daquele card não tem a contagem, e ela é irrecuperável — o
 * `criaAproveitamento` calculava o total para dividir e descartava. Zero
 * afirmaria que nenhuma questão da prova toca a matéria, que é outra coisa.
 */
function baseDe(questoes: number | undefined): string | null {
  if (typeof questoes !== "number" || questoes <= 0) return null;
  return questoes === 1 ? "de 1 questão" : `de ${questoes} questões`;
}

function LinhaDeMateria({
  nome,
  nota,
  questoes,
  mediaDaTurma,
  frentes,
}: {
  nome: string;
  nota: number;
  /** ⚠️ Ausente em histórico anterior ao card 30 — ver `baseDe`. */
  questoes?: number;
  mediaDaTurma: number | undefined;
  frentes: {
    id: string;
    nome: string;
    aproveitamento: number;
    questoes?: number;
  }[];
}) {
  /*
    ⚠️ **Fechadas por padrão** (card 10). O `frentes[]` tem a granularidade
    fina, e é aqui — não na tabela do card 07 — que ela cabe. Mas 15 frentes
    abertas de largada recriam exatamente o problema que este bloco veio
    resolver: 90 linhas de detalhe onde se queria um diagnóstico.
  */
  const [aberta, setAberta] = useState(false);
  const temFrentes = frentes.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          data-materia={nome}
          disabled={!temFrentes}
          onClick={() => setAberta((v) => !v)}
          aria-expanded={temFrentes ? aberta : undefined}
          className={cn(
            "w-32 shrink-0 truncate text-left",
            dashV2.text.primary,
            temFrentes && "underline-offset-2 hover:underline",
            temFrentes && dashV2.focus,
          )}
        >
          {temFrentes && (aberta ? "▾ " : "▸ ")}
          {nome}
        </button>

        <span className={cn("w-10 shrink-0 text-right font-medium")}>
          {Math.round(nota * 100)}%
        </span>

        {/*
          ⚠️ **A base ao lado do percentual, e é o card 14 quem manda** (card
          30). Desde aquele card uma questão conta inteira em CADA (matéria,
          frente) que toca — 928 das 1.616 frentes secundárias são de matéria
          diferente da questão —, então as matérias somam mais que o total da
          prova, de propósito. Sem a base, quem soma acha que a conta não fecha
          e desconfia da tela inteira.

          ⚠️ Largura fixa: sem ela, "de 5" e "de 12 questões" desalinham a barra
          entre matérias, e o olho lê o desalinhamento como diferença de valor.
        */}
        <span
          data-base={nome}
          className={cn(
            "w-24 shrink-0 text-right text-xs tabular-nums",
            dashV2.text.muted,
          )}
        >
          {baseDe(questoes)}
        </span>

        {/* ⚠️ `div` com `width: %`, como a barra do card 19 — não um gráfico. */}
        <span className="h-2 flex-1 overflow-hidden rounded-sm bg-lightGray">
          <span
            className={cn("block h-full rounded-sm", dashV2.progress.done)}
            style={{ width: `${Math.round(nota * 100)}%` }}
          />
        </span>

        {/*
          ⚠️ **A média da turma ao lado, SEMPRE.** Mesmo princípio do
          `formatarDificuldade`, que nunca mostra percentual sem a base: "30% em
          Matemática" só vira informação contra o "52%" da turma. Sem isto o
          bloco é bonito e não decide nada.

          ⚠️ Travessão quando a turma não tem essa matéria no resumo: acontece
          se o aluno tem matéria que ninguém mais respondeu. Inventar um número
          seria pior que admitir a ausência.
        */}
        <span
          data-turma={nome}
          className={cn("w-24 shrink-0 text-right text-xs", dashV2.text.muted)}
        >
          {mediaDaTurma === undefined
            ? `turma: ${VAZIO}`
            : `turma: ${Math.round(mediaDaTurma * 100)}%`}
        </span>
      </div>

      {aberta && (
        <ul data-frentes={nome} className="ml-34 flex flex-col gap-0.5 pl-2">
          {frentes.map((f) => (
            <li
              key={f.id}
              className={cn(
                "flex items-center justify-between text-xs",
                dashV2.text.secondary,
              )}
            >
              <span className="truncate">{f.nome}</span>
              <span className="shrink-0">
                {Math.round(f.aproveitamento * 100)}%
                {/*
                  ⚠️ Na frente a base importa AINDA mais: uma frente com 2
                  questões e 50% não é diagnóstico nenhum, e sem o "de 2" ela
                  parece ter o mesmo peso de uma com 14.
                */}
                {baseDe(f.questoes) !== null && (
                  <span data-base-frente={f.nome} className={cn("ml-2", dashV2.text.muted)}>
                    {baseDe(f.questoes)}
                  </span>
                )}
              </span>
            </li>
          ))}
          {frentesSomamMais(questoes, frentes) && (
            <li
              data-aviso-frentes={nome}
              className={cn("pt-1 text-xs italic", dashV2.text.muted)}
            >
              {TEXTO_FRENTES_SOMAM_MAIS}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * O diagnóstico do estudante, acima da tabela questão a questão.
 *
 * O modal abria com o nome e **imediatamente 90 linhas**. O detalhe responde
 * uma pergunta de VERIFICAÇÃO ("o que ele marcou na 34?"), e quem abre o modal
 * quase sempre chega com uma de DIAGNÓSTICO ("por que o Pedro foi mal?") — para
 * a qual a tabela é o caminho mais longo possível: rolar 90 linhas somando de
 * cabeça o que um agregado responde numa linha.
 *
 * ⚠️ **Nada aqui é recalculado.** O percentual por matéria vem do contrato do
 * card 02, os acertos do card 08, a média da turma do resumo. Recalcular a
 * partir das `respostas` que o modal carregou produziria um SEGUNDO número para
 * a mesma coisa, e os dois divergiriam no primeiro `null` tratado diferente —
 * a mesma regra que o docblock do `dificuldade` já registra ("uma fonte só").
 *
 * A única exceção é a contagem de "sem leitura", e ela é justificada abaixo.
 *
 * ⚠️ **Desvio em p.p., e não posição na turma** — decisão registrada no card
 * 08: esta tela é a base do que um dia vira tela do aluno, e ranking nominal
 * teria de nascer marcado como "nunca expor". O mockup do card 10 ainda mostra
 * "12º de 27"; a decisão é posterior a ele.
 */
export function ResumoDoEstudante({
  linha,
  totalDeQuestoes,
  mediaDoRecorte,
  materiasDaTurma,
  respostas,
}: {
  linha: LinhaDoRelatorio;
  totalDeQuestoes: number;
  mediaDoRecorte: number | null;
  /** Do resumo — a referência de cada matéria. */
  materiasDaTurma: MediaPorMateria[];
  /** Do detalhe que o modal carregou — só para contar o que não foi lido. */
  respostas: RespostaDoEstudante[];
}) {
  const materias = linha.aproveitamentoPorMateria ?? [];
  const par = acertosSobreTotal(linha, totalDeQuestoes);
  const desvio = formatarDesvio(desvioEmPontos(linha, mediaDoRecorte));
  const percentual =
    typeof linha.aproveitamentoGeral === "number"
      ? `${Math.round(linha.aproveitamentoGeral * 100)}%`
      : null;

  /*
    ⚠️ **O ÚNICO número calculado aqui**, e pode ser: ele não existe em lugar
    nenhum do contrato para discordar. É o que explica um aproveitamento baixo
    sem que o aluno tenha errado — e hoje só se obtém contando linhas "Sem
    leitura" na tabela à mão.
  */
  const semLeitura = respostas.filter(
    (r) => r.resultado === "sem_leitura",
  ).length;

  const mediaPorId = new Map(materiasDaTurma.map((m) => [m.id, m.media]));

  return (
    <section
      data-testid="resumo-do-estudante"
      className={cn("flex flex-col gap-3 rounded-md border p-3", dashV2.border)}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
        {par !== null && (
          <span className={cn("text-lg font-semibold", dashV2.text.primary)}>
            {par} acertos
          </span>
        )}
        {percentual !== null && (
          <span className={dashV2.text.secondary}>
            {par !== null && "· "}
            {percentual}
          </span>
        )}
        {desvio !== null && (
          <span data-desvio className={cn("text-xs", dashV2.text.muted)}>
            · {desvio} que a turma
          </span>
        )}
      </div>

      {materias.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {materias.map((m) => (
            <LinhaDeMateria
              key={m.id}
              nome={m.nome}
              nota={m.aproveitamento}
              questoes={m.questoes}
              mediaDaTurma={mediaPorId.get(m.id)}
              frentes={m.frentes ?? []}
            />
          ))}
        </div>
      )}

      {/*
        ⚠️ **A segunda frase é o card 13, e é o ponto dele.** A contagem já
        existia (card 10) e era muda sobre a consequência: `criaAproveitamento`
        divide por TODAS as questões do simulado, então questão não lida entra
        no denominador e não no numerador — ou seja, **conta como erro**.

        Sem dizer isso, o modal mostra "45 acertos · 50%" ao lado de "3 questões
        sem leitura" e deixa o leitor supor que os dois números são
        independentes. São o mesmo número: 50% já pune as três.

        ⚠️ E "provavelmente", não "certamente": branco e dupla marcação chegam
        indistinguíveis do `ms-omr`, então não dá para afirmar que o aluno
        respondeu e o leitor falhou. A opção C do card é exatamente não tentar
        separar o que os dados não separam — e mostrar a ambiguidade.
      */}
      {semLeitura > 0 && (
        <p data-sem-leitura className={cn("text-xs", dashV2.text.muted)}>
          {semLeitura} quest{semLeitura === 1 ? "ão" : "ões"} sem leitura neste
          cartão — {semLeitura === 1 ? "ela conta" : "elas contam"} como erro no
          aproveitamento acima.
        </p>
      )}
    </section>
  );
}
