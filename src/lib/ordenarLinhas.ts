import type { DataTableSort } from "@/components/ui/data-table";

export type ValorOrdenavel = string | number | boolean | null | undefined;

/**
 * Ordena em memória as linhas de uma `DataTable` (ela não reordena sozinha).
 * `valores` diz, por id de coluna, o valor pelo qual ordenar; coluna sem entrada
 * mantém a ordem. Texto compara em pt-BR sem diferenciar acento/caixa e com
 * números naturais; vazio vai sempre para o fim. Estável.
 */
export function ordenarLinhas<T>(
  rows: T[],
  sort: DataTableSort | undefined,
  valores: Record<string, (row: T) => ValorOrdenavel>,
): T[] {
  const valorDe = sort ? valores[sort.columnId] : undefined;
  if (!sort || !valorDe) return rows;
  const fator = sort.direction === "asc" ? 1 : -1;
  const vazio = (v: ValorOrdenavel) => v === null || v === undefined || v === "";
  return rows
    .map((row, i) => ({ row, i, v: valorDe(row) }))
    .sort((a, b) => {
      if (vazio(a.v) || vazio(b.v)) {
        if (vazio(a.v) && vazio(b.v)) return a.i - b.i;
        return vazio(a.v) ? 1 : -1;
      }
      let cmp: number;
      if (typeof a.v === "number" && typeof b.v === "number") cmp = a.v - b.v;
      else if (typeof a.v === "boolean" && typeof b.v === "boolean") cmp = Number(a.v) - Number(b.v);
      else
        cmp = String(a.v).localeCompare(String(b.v), "pt-BR", {
          numeric: true,
          sensitivity: "base",
        });
      return cmp === 0 ? a.i - b.i : cmp * fator;
    })
    .map(({ row }) => row);
}
