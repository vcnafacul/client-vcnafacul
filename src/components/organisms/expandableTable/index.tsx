/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ALINHAMENTO = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => ReactNode;
}

export interface ExpandableTableProps<T, K> {
  data: T[];
  columns: TableColumn<K>[];
  groupBy: (item: T) => string | number;
  aggregate: (items: T[]) => K;
  expandableContent: (items: T[]) => ReactNode;
  expandableTitle?: string;
  /** Nome acessível da tabela. */
  rotulo?: string;
}

function ExpandableTableRow<T, K>({
  row,
  columns,
  aggregate,
  expandableContent,
  expandableTitle = "Detalhes",
}: {
  row: { key: string | number; items: T[] };
  columns: TableColumn<K>[];
  aggregate: (items: T[]) => K;
  expandableContent: (items: T[]) => ReactNode;
  expandableTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const idDetalhes = useId();
  const aggregated = aggregate(row.items);
  const rotulo = open ? "Recolher" : "Expandir";

  return (
    <>
      {/* Linha principal */}
      <TableRow className={open ? "border-b-0" : undefined}>
        <TableCell className="w-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${rotulo} ${expandableTitle.toLowerCase()} de ${row.key}`}
            aria-expanded={open}
            aria-controls={open ? idDetalhes : undefined}
            onClick={() => setOpen(!open)}
            className="sm:h-8 sm:w-8"
          >
            {open ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </TableCell>
        {columns.map((column) => {
          const value =
            column.key === "groupKey"
              ? row.key
              : (aggregated as any)[column.key];
          const classe = ALINHAMENTO[column.align || "left"];
          const conteudo = column.render
            ? column.render(value, aggregated as unknown as K)
            : value;
          return column.key === "groupKey" ? (
            <th
              key={column.key as string}
              scope="row"
              className={`px-3 py-2 align-middle font-normal ${classe}`}
            >
              {conteudo}
            </th>
          ) : (
            <TableCell key={column.key as string} className={classe}>
              {conteudo}
            </TableCell>
          );
        })}
      </TableRow>

      {/* Linha expandida */}
      {open && (
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="py-0">
            <div id={idDetalhes} className="m-2">
              <h4 className="mb-2 text-h4 text-foreground">
                {expandableTitle}
              </h4>
              {expandableContent(row.items)}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ExpandableTable<T, K>({
  data,
  columns,
  groupBy,
  aggregate,
  expandableContent,
  expandableTitle,
  rotulo = "Tabela com linhas expansíveis",
}: ExpandableTableProps<T, K>) {
  // Agrupar dados
  const groupedData = data.reduce((acc, item) => {
    const key = groupBy(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string | number, T[]>);

  const groupedRows = Object.entries(groupedData).map(([key, items]) => ({
    key,
    items,
  }));

  return (
    <Card className="px-4">
      <Table aria-label={rotulo}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-5">
              <span className="sr-only">Expandir</span>
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key as string}
                className={ALINHAMENTO[column.align || "left"]}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedRows.map((row) => (
            <ExpandableTableRow
              key={row.key}
              row={row}
              columns={columns}
              aggregate={aggregate}
              expandableContent={expandableContent}
              expandableTitle={expandableTitle}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default ExpandableTable;
