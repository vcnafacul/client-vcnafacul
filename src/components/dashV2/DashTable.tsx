import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DashTableErro, DashTableVazio } from "./DashTableEmpty";
import type { DashColumn, DashTableProps } from "./types";
import { useAcimaDeSm } from "./useAcimaDeSm";

/**
 * Tabela densa da dash: adaptador do `components/ui/data-table` com a API de
 * sempre, até a Task 11 (tickets/059). Quem desenha é a DataTable; aqui só se
 * traduzem as colunas e os estados.
 *
 * ⚠️ **Não reordena `rows`.** Clicar no cabeçalho só chama `onSortChange`. A
 * tela decide se ordena em memória (`sortRows`) ou pede ordenado ao servidor.
 */

/**
 * ⚠️ Aqui CSS **pode**: esconder coluna não põe uma segunda cópia do conteúdo no
 * DOM. É a virada tabela→cartões que precisa de JS (e a DataTable faz).
 */
function visibilidade<T>(col: DashColumn<T>): string | undefined {
  if (col.hideBelow === "sm") return "hidden sm:table-cell";
  if (col.hideBelow === "md") return "hidden md:table-cell";
  return undefined;
}

/**
 * Os papéis do cartão no celular, como a lista empilhada da DashTable sempre
 * fez: a coluna `primary` (ou a primeira) em cima, duas abaixo e a última no
 * lugar do status. `hideBelow` → `mobile: "hidden"`.
 */
function paraColunasDoUi<T>(columns: DashColumn<T>[]): DataTableColumn<T>[] {
  const titulo = columns.find((c) => c.primary) ?? columns[0];
  const restantes = columns.filter((c) => c !== titulo && !c.hideBelow);
  const status = restantes.length > 1 ? restantes[restantes.length - 1] : undefined;
  const abaixo = restantes.filter((c) => c !== status).slice(0, 2);

  return columns.map((col) => ({
    id: col.id,
    header: col.header,
    cell: col.cell,
    align: col.align,
    width: col.width,
    sortable: !!col.sortValue,
    className: visibilidade(col),
    mobile:
      col === titulo
        ? "title"
        : col === status
          ? "status"
          : abaixo.includes(col)
            ? "meta"
            : "hidden",
  }));
}

export function DashTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  density = "base",
  state = "idle",
  onRetry,
  emptyState,
  stickyHeader = true,
}: DashTableProps<T>) {
  const acimaDeSm = useAcimaDeSm();
  const colunas = useMemo(() => paraColunasDoUi(columns), [columns]);

  return (
    <div
      data-testid="dash-table"
      data-modo={acimaDeSm ? "tabela" : "lista"}
      className="w-full"
    >
      <DataTable<T>
        rows={rows}
        columns={colunas}
        getRowId={rowKey}
        onRowClick={onRowClick}
        sort={sort}
        onSortChange={onSortChange}
        density={density === "compact" ? "compact" : "default"}
        state={state === "idle" ? "ready" : state}
        // Os textos de sempre ("Erro ao carregar", "Tentar novamente"): a migração não muda texto.
        errorState={<DashTableErro onRetry={onRetry} />}
        emptyState={emptyState ?? <DashTableVazio />}
        stickyHeader={stickyHeader}
        // A moldura é de quem compõe (o `DashListTemplate` já põe a borda).
        className="rounded-none border-0"
      />
    </div>
  );
}

export default DashTable;
