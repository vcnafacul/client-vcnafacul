import {
  DashTable,
  dashV2,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { SimuladoComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { buscarRelatorio } from "@/services/relatorioSimulado/buscarRelatorio";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acimaDaTurma,
  compararAplicacoes,
  formatarDelta,
  type Comparacao,
  type LinhaComparada,
} from "./comparacaoEntreAplicacoes";
import { SEM_NOME } from "@/pages/partnerClassWithStudents/SimuladosDaTurma";

export const TEXTO_ESCOLHA =
  "Escolha duas aplicações para comparar.";
export const TEXTO_SEM_INTERSECAO =
  "Nenhum estudante fez as duas aplicações com leitura concluída. Sem gente em comum não há o que comparar.";

/**
 * ⚠️ Os nomes vêm da listagem que a aba já carrega — buscar de novo repetiria
 * uma consulta por causa de um rótulo.
 */
function nomeDo(simulados: SimuladoComCartao[], id: string): string {
  return simulados.find((s) => s.simuladoId === id)?.nome ?? SEM_NOME;
}

/**
 * Compara duas aplicações, aluno a aluno (card 31).
 *
 * ⚠️ **O degrau 2 do card 17 já responde "o Pedro melhorou?"** — a série dele,
 * com a linha da turma junto. O que faltava era varrer a turma INTEIRA de uma
 * vez: hoje isso exige abrir 30 modais, um por aluno.
 *
 * ⚠️ **Sem backend novo.** Duas chamadas ao relatório que já existe, e a
 * interseção calculada aqui. A regra do card 17 continua valendo: já são dois os
 * lugares que calculam desempenho de turma, e um terceiro daria três números
 * diferentes para a mesma turma na mesma semana.
 */
/*
  ⚠️ **O arquivo se chama `TabelaDeComparacao`, e não `ComparacaoEntreAplicacoes`,
  por um motivo concreto:** o módulo de cálculo é `comparacaoEntreAplicacoes.ts`,
  e os dois nomes diferiam só na primeira letra. O macOS não distingue maiúscula
  de minúscula no sistema de arquivos, e o TypeScript recusou com
  `differs from already included file name only in casing` — mas num Linux (o CI)
  os dois arquivos coexistiriam e o import resolveria para o errado, sem erro.
*/
export function TabelaDeComparacao({
  token,
  turmaId,
  simulados,
}: {
  token: string;
  /** Ausente = o cursinho inteiro. */
  turmaId?: string;
  /** A listagem que a aba já tem — para o seletor e para os nomes. */
  simulados: SimuladoComCartao[];
}) {
  /*
    ⚠️ **A mais ANTIGA à esquerda, por padrão.** A lista vem ordenada por último
    envio (a mais recente primeiro), e inverter aqui é o que faz "melhorou" ser
    melhora. Com a ordem trocada toda subida viraria queda, sem nada na tela
    denunciando.
  */
  const [antesId, setAntesId] = useState<string | null>(
    () => simulados[1]?.simuladoId ?? null,
  );
  const [depoisId, setDepoisId] = useState<string | null>(
    () => simulados[0]?.simuladoId ?? null,
  );

  const [comparacao, setComparacao] = useState<Comparacao | null>(null);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("idle");
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "delta",
    direction: "asc",
  });

  const carregar = useCallback(() => {
    if (antesId === null || depoisId === null || antesId === depoisId) {
      setComparacao(null);
      return;
    }
    setEstado("loading");
    Promise.all([
      buscarRelatorio(token, antesId, turmaId),
      buscarRelatorio(token, depoisId, turmaId),
    ])
      .then(([a, d]) => {
        setComparacao(compararAplicacoes(a, d));
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [token, turmaId, antesId, depoisId]);

  useEffect(carregar, [carregar]);

  const colunas: DashColumn<LinhaComparada>[] = useMemo(
    () => [
      {
        id: "estudante",
        header: "Estudante",
        width: "16rem",
        primary: true,
        cell: (l) => l.nome,
        sortValue: (l) => l.nome,
      },
      {
        id: "antes",
        header: nomeDo(simulados, antesId ?? ""),
        width: "10rem",
        align: "right",
        cell: (l) => `${Math.round(l.antes * 100)}%`,
        sortValue: (l) => l.antes,
      },
      {
        id: "depois",
        header: nomeDo(simulados, depoisId ?? ""),
        width: "10rem",
        align: "right",
        cell: (l) => `${Math.round(l.depois * 100)}%`,
        sortValue: (l) => l.depois,
      },
      {
        id: "delta",
        header: "Variação",
        width: "11rem",
        align: "right",
        /*
          ⚠️ **A cor compara com a TURMA, não com zero.** Um aluno que caiu 7
          numa turma que caiu 10 subiu de posição — pintar de vermelho ali seria
          factualmente defensável e pedagogicamente errado. É a mesma leitura
          que o gráfico do card 17 já pratica.
        */
        cell: (l) => {
          const acima = acimaDaTurma(l.delta, comparacao?.deltaDaMedia ?? null);
          return (
            <span
              data-delta={l.usuario}
              data-acima={acima === null ? undefined : String(acima)}
              className={cn(
                "font-medium",
                acima === true && "text-green-700",
                acima === false && "text-red-700",
              )}
            >
              {formatarDelta(l.delta)}
            </span>
          );
        },
        sortValue: (l) => l.delta,
      },
    ],
    [simulados, antesId, depoisId, comparacao],
  );

  const ordenadas = useMemo(
    () => sortRows(comparacao?.linhas ?? [], colunas, sort),
    [comparacao, colunas, sort],
  );

  const opcoes = simulados.map((s) => (
    <option key={s.simuladoId} value={s.simuladoId}>
      {s.nome ?? SEM_NOME}
    </option>
  ));

  return (
    <section data-comparacao className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 px-4 text-sm print:hidden">
        <label className={dashV2.text.secondary}>
          De{" "}
          <select
            data-seletor-antes
            value={antesId ?? ""}
            onChange={(e) => setAntesId(e.target.value)}
            className="rounded-md border px-2 py-1"
          >
            {opcoes}
          </select>
        </label>
        <label className={dashV2.text.secondary}>
          para{" "}
          <select
            data-seletor-depois
            value={depoisId ?? ""}
            onChange={(e) => setDepoisId(e.target.value)}
            className="rounded-md border px-2 py-1"
          >
            {opcoes}
          </select>
        </label>
      </div>

      {antesId === depoisId && (
        <p data-mesma-aplicacao className={cn("px-4 text-xs", dashV2.text.muted)}>
          {TEXTO_ESCOLHA}
        </p>
      )}

      {comparacao !== null && comparacao.linhas.length === 0 && (
        <p data-sem-intersecao className={cn("px-4 text-xs", dashV2.text.muted)}>
          {TEXTO_SEM_INTERSECAO}
        </p>
      )}

      {comparacao !== null && comparacao.linhas.length > 0 && (
        <>
          {/*
            ⚠️ **A variação da turma vem ANTES da tabela**, porque é ela que dá
            sentido a cada linha: sem saber que a turma caiu 10, "−7 p.p." se lê
            como queda.
          */}
          <p data-resumo className={cn("px-4 text-sm", dashV2.text.secondary)}>
            {comparacao.linhas.length} estudante(s) fizeram as duas · a turma:{" "}
            <strong>{formatarDelta(comparacao.deltaDaMedia ?? 0)}</strong>
          </p>

          <DashTable<LinhaComparada>
            rows={ordenadas}
            columns={colunas}
            rowKey={(l) => `${l.usuario}:${l.matricula}`}
            sort={sort}
            onSortChange={setSort}
            state={estado}
            onRetry={carregar}
            stickyHeader
          />
        </>
      )}

      {/*
        ⚠️ **Contado, NUNCA listado** — mesma regra do `linhasSemEstudanteAtivo`.
        E o número precisa aparecer: sem ele, uma comparação de 19 numa turma de
        30 parece que perdeu gente.
      */}
      {comparacao !== null && comparacao.foraDaIntersecao > 0 && (
        <p data-fora className={cn("px-4 text-xs", dashV2.text.muted)}>
          {comparacao.foraDaIntersecao} estudante(s) fizeram só uma das duas
          aplicações e não entram na comparação.
        </p>
      )}
    </section>
  );
}
