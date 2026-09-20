import {
  DashTable,
  dashV2,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

export const TEXTO_SEM_QUESTOES = "Nenhuma questão com resposta ainda";

/**
 * O vazio desta aba.
 *
 * ⚠️ **Não é o `DashTableVazio`**, que não recebe prop nenhuma: ele traz o
 * texto genérico e a dica "tente limpar os filtros", e esta tabela não tem
 * filtro. O próprio `DashTableEmpty.tsx` manda a tela passar um `emptyState`
 * próprio quando o vazio é "não existe registro ainda" — que é este caso.
 */
function VazioDeQuestoes() {
  return (
    <div
      data-testid="questoes-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_SEM_QUESTOES}
      </p>
      <p className={cn("text-xs", dashV2.text.secondary)}>
        As questões aparecem aqui conforme os cartões forem lidos.
      </p>
    </div>
  );
}

const colunas: DashColumn<QuestaoDoRelatorio>[] = [
  {
    id: "numero",
    header: "Questão",
    width: "6rem",
    primary: true,
    // ⚠️ Questão sem número não some: vai para o fim (o `sortRows` manda nulo
    // para o fim nas duas direções) e mostra travessão.
    cell: (q) => q.numero ?? "—",
    sortValue: (q) => q.numero,
  },
  {
    id: "acertos",
    header: "Acertos",
    width: "6rem",
    align: "right",
    cell: (q) => q.acertos,
    sortValue: (q) => q.acertos,
  },
  {
    id: "erros",
    header: "Erros",
    width: "6rem",
    align: "right",
    cell: (q) => q.erros,
    sortValue: (q) => q.erros,
  },
  {
    id: "semLeitura",
    // ⚠️ "Sem leitura", não "Em branco": o ms-omr descarta questão em branco e
    // dupla marcação do mesmo jeito. Chamar de branco afirma o que ninguém
    // verificou — e é o número que o professor usa para decidir o que revisar.
    header: "Sem leitura",
    width: "7rem",
    align: "right",
    cell: (q) => q.semLeitura,
    sortValue: (q) => q.semLeitura,
  },
  {
    id: "distribuicao",
    header: "Por alternativa",
    cell: (q) => (
      <div className="flex gap-3">
        {ALTERNATIVAS.map((alt) => (
          <span key={alt} className={cn("text-xs", dashV2.text.secondary)}>
            <span className="font-medium">{alt}</span>{" "}
            {q.porAlternativa[alt] ?? 0}
          </span>
        ))}
      </div>
    ),
  },
];

export function TabelaDeQuestoes({
  questoes,
  estado,
  onRetry,
}: {
  questoes: QuestaoDoRelatorio[];
  estado: "idle" | "loading" | "error";
  onRetry?: () => void;
}) {
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "numero",
    direction: "asc",
  });

  // ⚠️ O `DashTable` não ordena sozinho — ele só avisa. Quem ordena é o
  // `sortRows`, que já trata nulos no fim e ordenação estável.
  const linhas = useMemo(
    () => sortRows(questoes, colunas, sort),
    [questoes, sort],
  );

  return (
    <DashTable<QuestaoDoRelatorio>
      rows={linhas}
      columns={colunas}
      rowKey={(q) => q.questaoId}
      sort={sort}
      onSortChange={setSort}
      state={estado}
      onRetry={onRetry}
      stickyHeader
      emptyState={<VazioDeQuestoes />}
    />
  );
}
