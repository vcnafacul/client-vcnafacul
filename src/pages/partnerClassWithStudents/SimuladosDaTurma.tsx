import {
  DashTable,
  dashV2,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { SimuladoComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { DASH, PARTNER_CLASS, RELATORIO_SIMULADO } from "@/routes/path";
import { buscarSimuladosComCartao } from "@/services/relatorioSimulado/buscarSimuladosComCartao";
import type { EstadoDeVolta } from "../relatorioSimulado/voltar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const VAZIO = "—";
export const SEM_NOME = "Simulado removido";
export const TEXTO_VAZIO = "Nenhum simulado desta turma teve cartão enviado";

function dataCurta(iso: string | null): string {
  if (!iso) return VAZIO;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? VAZIO : d.toLocaleDateString("pt-BR");
}

/**
 * O vazio desta aba.
 *
 * ⚠️ **Não é o `DashTableVazio`**, que não recebe prop nenhuma: ele traz o
 * texto genérico e a dica "tente limpar os filtros", e esta lista não tem
 * filtro. O próprio `DashTableEmpty.tsx` manda a tela passar um `emptyState`
 * próprio quando o vazio é "não existe registro ainda" — que é este caso.
 * Mesma forma do `TabelaDeQuestoes`.
 *
 * ⚠️ Esta é a **única** superfície de vazio da aba, e o erro fica por conta do
 * `DashTable` (`state` + `onRetry`). A revisão do card `06` pegou exatamente o
 * defeito de ter duas — duas mensagens e dois botões na mesma tela.
 */
function VazioDeSimulados() {
  return (
    <div
      data-testid="simulados-da-turma-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_VAZIO}
      </p>
      <p className={cn("text-xs", dashV2.text.secondary)}>
        Os simulados aparecem aqui conforme os cartões forem enviados.
      </p>
    </div>
  );
}

const colunas: DashColumn<SimuladoComCartao>[] = [
  {
    id: "nome",
    header: "Simulado",
    primary: true,
    /**
     * ⚠️ `nome` nulo NÃO some da lista: o `04b` devolve nulo quando o documento
     * do `Simulado` sumiu, e os cartões continuam existindo. Esconder seria o
     * oposto do que este relatório serve para fazer — e o relatório dele abre,
     * porque as respostas vivem no `Historico`, não no simulado.
     */
    cell: (s) => s.nome ?? SEM_NOME,
    sortValue: (s) => s.nome ?? SEM_NOME,
  },
  {
    id: "cartoes",
    header: "Cartões",
    width: "7rem",
    align: "right",
    // ⚠️ PESSOAS, não fotos: a unicidade da junção é {simulado, cursinho, usuario}
    cell: (s) => s.cartoes,
    sortValue: (s) => s.cartoes,
  },
  {
    id: "lidos",
    // ⚠️ Mesmo rótulo que o relatório adotou: a api conta com status completed
    // E nota numérica, então "com leitura concluída" prometeria outra coisa.
    header: "No cálculo da média",
    width: "11rem",
    align: "right",
    hideBelow: "sm",
    cell: (s) => s.comLeituraConcluida,
    sortValue: (s) => s.comLeituraConcluida,
  },
  {
    id: "ultimoEnvio",
    header: "Último envio",
    width: "9rem",
    align: "right",
    hideBelow: "md",
    /**
     * ⚠️ **Não é "última atividade".** É quando o estudante mais recente entrou
     * no recorte: o `registrar` do ms é upsert, então reenvio do mesmo
     * estudante não move a data. O rótulo não pode prometer mais que isso.
     */
    cell: (s) => dataCurta(s.ultimoEnvio),
    sortValue: (s) => (s.ultimoEnvio ? new Date(s.ultimoEnvio) : null),
  },
];

type Estado = "idle" | "loading" | "error";

export function SimuladosDaTurma({
  token,
  turmaId,
}: {
  token: string;
  turmaId: string;
}) {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState<SimuladoComCartao[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "ultimoEnvio",
    direction: "desc",
  });

  const carregar = useCallback(() => {
    setEstado("loading");
    buscarSimuladosComCartao(token, turmaId)
      .then((r) => {
        setSimulados(r.simulados);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  }, [token, turmaId]);

  useEffect(carregar, [carregar]);

  /**
   * ⚠️ **Tipado**, e não um literal solto: é o que faz o contrato de
   * `relatorioSimulado/voltar.ts` valer nesta ponta também. Só o `caminho` —
   * não há filtro, prova nem página aqui para restaurar.
   */
  const deAqui: EstadoDeVolta = useMemo(
    () => ({ caminho: `${DASH}/${PARTNER_CLASS}/${turmaId}` }),
    [turmaId],
  );

  // ⚠️ O `DashTable` não ordena sozinho — ele só avisa. Quem ordena é o
  // `sortRows`, que já trata nulos no fim e ordenação estável.
  const linhas = useMemo(
    () => sortRows(simulados, colunas, sort),
    [simulados, sort],
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      {/*
        ⚠️ Escrito aqui, e não só dentro do relatório: é nesta lista que a
        pessoa decide entrar.
      */}
      <p className={cn("text-xs", dashV2.text.muted)}>
        Só aparecem simulados respondidos por cartão-resposta. Quem resolveu
        pela plataforma não entra nesta lista nem nos relatórios dela.
      </p>

      <DashTable<SimuladoComCartao>
        rows={linhas}
        columns={colunas}
        rowKey={(s) => s.simuladoId}
        onRowClick={(s) =>
          navigate(
            `${DASH}/${RELATORIO_SIMULADO}/${s.simuladoId}?turma=${turmaId}`,
            // ⚠️ Sem isto o "voltar" do relatório cai no fallback e manda a
            // pessoa para a LISTAGEM DE PROVAS, que ela não visitou.
            { state: { de: deAqui } },
          )
        }
        sort={sort}
        onSortChange={setSort}
        state={estado}
        onRetry={carregar}
        stickyHeader
        emptyState={<VazioDeSimulados />}
      />
    </div>
  );
}

export default SimuladosDaTurma;
