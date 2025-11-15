/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

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
  const aggregated = aggregate(row.items);

  return (
    <>
      {/* Linha principal */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell className="w-5" size="small">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </IconButton>
        </TableCell>
        {columns.map((column) => {
          const value =
            column.key === "groupKey"
              ? row.key
              : (aggregated as any)[column.key];
          return (
            <TableCell
              key={column.key as string}
              align={column.align || "left"}
              component={column.key === "groupKey" ? "th" : "td"}
              scope={column.key === "groupKey" ? "row" : undefined}
            >
              {column.render
                ? column.render(value, aggregated as unknown as K)
                : value}
            </TableCell>
          );
        })}
      </TableRow>

      {/* Linha expandida */}
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={columns.length + 1}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                {expandableTitle}
              </Typography>
              {expandableContent(row.items)}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
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
    <TableContainer component={Paper} className="px-4">
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell size="small" />
            {columns.map((column) => (
              <TableCell
                size="small"
                key={column.key as string}
                align={column.align || "left"}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
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
    </TableContainer>
  );
}

export default ExpandableTable;
