import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  BlocosSkeleton,
  DashTableErro,
  DashTableVazio,
  LinhasSkeleton,
} from "./DashTableEmpty";
import { proximoSort } from "./sortRows";
import { dashV2 } from "./tokens";
import type { DashColumn, DashTableProps } from "./types";
import { useAcimaDeSm } from "./useAcimaDeSm";

/**
 * Tabela densa, ordenável, com estados.
 *
 * ⚠️ **Genérica de propósito.** Recebe `rows` e `columns` e desenha; não sabe o
 * que é uma prova. Quem liga isto ao contexto da dash é a tela — e é o que
 * deixa a tabela testável sozinha e reusável fora da dash.
 *
 * ⚠️ **Não reordena `rows`.** Clicar no cabeçalho só chama `onSortChange`. A
 * tela decide se ordena em memória (`sortRows`) ou pede ordenado ao servidor;
 * nenhuma das duas exige tocar aqui. Há teste para isso.
 *
 * ⚠️ **Sobre o `components/ui/table`:** as células, linhas e seções vêm de lá,
 * inalteradas. Duas peças ficam de fora, por motivo:
 *
 *  - O wrapper `<Table>` envolve tudo num `div.overflow-auto`. Um ancestral com
 *    `overflow` vira o scrollport do `position: sticky`, e como esse div não
 *    tem altura ele nunca rola — o cabeçalho grudaria nele e sumiria junto com
 *    a página. Aqui o `<table>` é direto, e o `sticky top-0` gruda na área de
 *    conteúdo da dash, que é quem rola de verdade.
 *  - O `<TableRow>` do cabeçalho: ele traz `hover:bg-muted/50` embutido, e
 *    cabeçalho não reage a hover. Cancelar isso custaria uma classe de cor
 *    escrita à mão; um `<tr>` pelado não custa nada.
 */

const ALINHAMENTO = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

const JUSTIFICA = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
} as const;

/**
 * ⚠️ Aqui CSS **pode**: esconder coluna não põe uma segunda cópia do conteúdo no
 * DOM. É a virada tabela→lista que precisa de JS.
 */
function visibilidade<T>(col: DashColumn<T>): string {
  if (col.hideBelow === "sm") return "hidden sm:table-cell";
  if (col.hideBelow === "md") return "hidden md:table-cell";
  return "";
}

/** `title` só quando o `cell` devolveu texto — em `ReactNode` não dá para adivinhar. */
function tituloDe(conteudo: React.ReactNode): string | undefined {
  return typeof conteudo === "string" || typeof conteudo === "number"
    ? String(conteudo)
    : undefined;
}

type Modo = "loading" | "error" | "empty" | "rows";

function modoDe(state: "idle" | "loading" | "error", quantasLinhas: number): Modo {
  if (state === "loading") return "loading";
  if (state === "error") return "error";
  return quantasLinhas === 0 ? "empty" : "rows";
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
  const modo = modoDe(state, rows.length);
  const vazio = emptyState ?? <DashTableVazio />;

  const conteudoDaCelula = (col: DashColumn<T>, row: T) => {
    const conteudo = col.cell(row);
    const titulo = tituloDe(conteudo);

    // ⚠️ A linha inteira é clicável por conveniência do mouse, mas é este
    // `<button>` que dá teclado e leitor de tela. `stopPropagation` porque sem
    // ele o clique sobe para a linha e a ação dispara duas vezes.
    if (col.primary && onRowClick) {
      return (
        <button
          type="button"
          title={titulo}
          onClick={(e) => {
            e.stopPropagation();
            onRowClick(row);
          }}
          className={cn(
            "block w-full truncate rounded-sm text-left font-medium",
            dashV2.text.primary,
            dashV2.focus,
          )}
        >
          {conteudo}
        </button>
      );
    }

    return (
      <span title={titulo} className="block truncate">
        {conteudo}
      </span>
    );
  };

  /* ------------------------------------------------------------------ *
   * Abaixo de 768px: lista empilhada.
   *
   * ⚠️ Em JS, e não `hidden md:block` + `md:hidden`: o caminho do CSS renderiza
   * a tabela **e** a lista e esconde uma, e leitor de tela lê as duas. Mesma
   * decisão do `DashToolbar`, mesmo hook.
   *
   * ⚠️ Sem scroll horizontal. Rolar tabela de lado no celular é pior do que
   * perder coluna — por isso só sobram três.
   * ------------------------------------------------------------------ */
  if (!acimaDeSm) {
    const colTitulo = columns.find((c) => c.primary) ?? columns[0];
    const restantes = columns.filter((c) => c !== colTitulo && !c.hideBelow);
    const colDireita = restantes.length > 1 ? restantes[restantes.length - 1] : undefined;
    const colsAbaixo = restantes.filter((c) => c !== colDireita).slice(0, 2);

    return (
      <div
        data-testid="dash-table"
        data-modo="lista"
        className={cn("w-full", dashV2.surface, dashV2.text.primary)}
      >
        {modo === "loading" ? <BlocosSkeleton /> : null}
        {modo === "error" ? <DashTableErro onRetry={onRetry} /> : null}
        {modo === "empty" ? vazio : null}
        {modo === "rows"
          ? rows.map((row) => (
              <div
                key={rowKey(row)}
                data-row-key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "flex items-start gap-3 border-b px-4 py-3",
                  dashV2.border,
                  dashV2.row.hover,
                  onRowClick && "cursor-pointer",
                )}
              >
                <div className="min-w-0 flex-1">
                  {colTitulo ? conteudoDaCelula(colTitulo, row) : null}
                  {colsAbaixo.length > 0 ? (
                    <div
                      className={cn(
                        "mt-0.5 flex flex-wrap gap-x-3 text-xs",
                        dashV2.text.secondary,
                      )}
                    >
                      {colsAbaixo.map((col) => (
                        <span key={col.id} data-column-id={col.id} className="truncate">
                          {col.cell(row)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {colDireita ? (
                  <div data-column-id={colDireita.id} className="shrink-0">
                    {colDireita.cell(row)}
                  </div>
                ) : null}
              </div>
            ))
          : null}
      </div>
    );
  }

  /* ------------------------------------------------------------------ *
   * Tabela.
   * ------------------------------------------------------------------ */
  return (
    <div
      data-testid="dash-table"
      data-modo="tabela"
      className={cn("w-full", dashV2.surface)}
    >
      {/*
        ⚠️ `table-fixed` + `width` no `<th>`: a largura para de depender do
        conteúdo, então a tabela não "dança" ao mudar de página e o skeleton
        ocupa exatamente o lugar dos dados. O preço é que texto longo precisa
        truncar — e nome de prova do ENEM é longo.
      */}
      <table className={cn("w-full table-fixed caption-bottom text-sm", dashV2.text.primary)}>
        <TableHeader>
          <tr className={cn("border-b", dashV2.border)}>
            {columns.map((col) => {
              const ordenavel = !!col.sortValue;
              const ativa = ordenavel && sort?.columnId === col.id;
              const alinhamento = col.align ?? "left";
              const Seta = !ativa
                ? ChevronsUpDown
                : sort?.direction === "asc"
                  ? ChevronUp
                  : ChevronDown;

              return (
                <th
                  key={col.id}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  // ⚠️ `aria-sort` só existe em coluna ordenável. Anunciar
                  // "none" numa coluna que nunca ordena promete uma interação
                  // que não existe.
                  aria-sort={
                    !ordenavel
                      ? undefined
                      : !ativa
                        ? "none"
                        : sort?.direction === "asc"
                          ? "ascending"
                          : "descending"
                  }
                  className={cn(
                    "align-middle font-medium",
                    dashV2.header,
                    dashV2.cell,
                    dashV2.text.secondary,
                    ALINHAMENTO[alinhamento],
                    visibilidade(col),
                    stickyHeader && "sticky top-0 z-10",
                    stickyHeader && dashV2.surface,
                  )}
                >
                  {ordenavel ? (
                    <button
                      type="button"
                      // ⚠️ `data-sort-id`, e não `data-column-id`: a célula do corpo
                      // já usa esse nome e um seletor de teste pegaria o cabeçalho
                      // por engano — foi o que aconteceu ao escrever este arquivo.
                      data-sort-id={col.id}
                      onClick={() => onSortChange?.(proximoSort(col.id, sort))}
                      className={cn(
                        "inline-flex w-full items-center gap-1 rounded-sm",
                        JUSTIFICA[alinhamento],
                        dashV2.focus,
                      )}
                    >
                      <span className="truncate">{col.header}</span>
                      <Seta aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  ) : (
                    <span className="block truncate">{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </TableHeader>

        <TableBody>
          {modo === "loading" ? (
            <LinhasSkeleton
              colunas={columns.map(visibilidade)}
              alturaLinha={dashV2.row[density]}
              classeDeCelula={dashV2.cell}
            />
          ) : null}

          {modo === "error" ? (
            <tr>
              <td colSpan={columns.length}>
                <DashTableErro onRetry={onRetry} />
              </td>
            </tr>
          ) : null}

          {modo === "empty" ? (
            <tr>
              <td colSpan={columns.length}>{vazio}</td>
            </tr>
          ) : null}

          {modo === "rows"
            ? rows.map((row) => (
                /* ⚠️ `rowKey(row)`, nunca o índice: com `key={index}` o React
                   reusa o DOM da posição e a lista pisca ao reordenar. */
                <TableRow
                  key={rowKey(row)}
                  data-row-key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b",
                    dashV2.border,
                    dashV2.row[density],
                    dashV2.row.hover,
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      data-column-id={col.id}
                      className={cn(
                        "py-0 align-middle",
                        dashV2.cell,
                        ALINHAMENTO[col.align ?? "left"],
                        visibilidade(col),
                      )}
                    >
                      {conteudoDaCelula(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </table>
    </div>
  );
}

export default DashTable;
