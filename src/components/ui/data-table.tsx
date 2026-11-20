import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, type LucideIcon } from "lucide-react"

import { useAboveSm } from "@/hooks/use-above-sm"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { EmptyState, ErrorState, type EmptyStateProps, type ErrorStateProps } from "./data-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { PaginationControls } from "./pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { TableSkeleton } from "./skeleton"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

/*
 * Tabela densa do design system (tickets/059 §3). Veio da DashTable do dashV2.
 *
 * - Não reordena `rows`: clicar no cabeçalho só chama `onSortChange`. Quem ordena
 *   (em memória ou no servidor) é a tela.
 * - Sem `overflow` em volta do `<table>`: um ancestral com overflow vira o
 *   scrollport do `sticky` e o cabeçalho deixa de grudar sem aviso.
 * - Abaixo de 768 as linhas viram cartões, em JS: com CSS a tabela e os cartões
 *   ficariam os dois no DOM e o leitor de tela leria os dois.
 */

export type DataTableMobileRole = "title" | "meta" | "status" | "hidden"

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** `right` para números: também alinha os dígitos (`tabular-nums`). */
  align?: "left" | "right" | "center"
  sortable?: boolean
  /** Largura CSS no `<th>` (`"200px"`, `"20%"`). */
  width?: string
  /**
   * Papel no cartão do celular. Sem papel: a primeira coluna é o título, a coluna
   * de `StatusBadge` é o status, as duas seguintes são meta e o resto some.
   */
  mobile?: DataTableMobileRole
  /** Classes no `<th>` e nos `<td>` da coluna, por exemplo `hidden md:table-cell`. */
  className?: string
}

export interface DataTableSort {
  columnId: string
  direction: "asc" | "desc"
}

export interface DataTablePagination {
  /** 1-based. */
  page: number
  pageSize: number
  /** Total do conjunto inteiro, não da página. */
  total: number
  onPageChange: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export interface DataTableRowAction {
  id: string
  label: string
  icon?: LucideIcon
  onSelect: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

export type DataTableState = "loading" | "empty" | "error" | "ready"

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  /**
   * Paginação no cliente: passe todas as linhas e a tabela mostra a página.
   * No servidor: passe só as linhas da página (no máximo `pageSize`).
   */
  rows: T[]
  /** Identidade estável da linha; nunca o índice sozinho (a lista pisca ao reordenar). */
  getRowId: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  sort?: DataTableSort
  onSortChange?: (sort: DataTableSort) => void
  /** Ids (de `getRowId`) das linhas selecionadas. Com `onSelectionChange`, liga a seleção. */
  selection?: string[]
  onSelectionChange?: (ids: string[]) => void
  pagination?: DataTablePagination
  state?: DataTableState
  toolbar?: React.ReactNode
  /** Aparecem na barra de seleção, com a contagem. */
  bulkActions?: React.ReactNode
  /** Itens do menu `⋯` da linha. */
  rowActions?: (row: T) => DataTableRowAction[]
  /** Cartão próprio no celular, no lugar do derivado dos papéis. */
  renderMobileCard?: (row: T) => React.ReactNode
  empty?: EmptyStateProps
  /** Mostra "Limpar filtros" no vazio. */
  onClearFilters?: () => void
  /** Substitui o vazio inteiro. */
  emptyState?: React.ReactNode
  error?: Pick<ErrorStateProps, "title" | "message">
  onRetry?: () => void
  /** Substitui o erro inteiro. */
  errorState?: React.ReactNode
  density?: "default" | "compact"
  stickyHeader?: boolean
  className?: string
  "aria-label"?: string
}

const ALINHAMENTO = { left: "text-left", right: "text-right tabular-nums", center: "text-center" } as const
const JUSTIFICA = { left: "justify-start", right: "justify-end", center: "justify-center" } as const
const ALTURA = { default: "h-10", compact: "h-8" } as const
const FOCO =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const EMPTY_TITLE = "Nenhum registro encontrado"
export const CLEAR_FILTERS_LABEL = "Limpar filtros"

const formatarNumero = (n: number) => n.toLocaleString("pt-BR")

function proximoSort(columnId: string, atual?: DataTableSort): DataTableSort {
  const ativa = atual?.columnId === columnId
  return { columnId, direction: ativa && atual?.direction === "asc" ? "desc" : "asc" }
}

function ehStatusBadge(node: React.ReactNode): boolean {
  return (
    React.isValidElement(node) &&
    typeof node.type !== "string" &&
    (node.type as { mobileRole?: string }).mobileRole === "status"
  )
}

/** Papel de cada coluna no cartão: os explícitos valem, e os padrões completam. */
function papeisNoCelular<T>(columns: DataTableColumn<T>[], amostra: T | undefined) {
  const papeis = new Map<string, DataTableMobileRole>()
  let temTitulo = columns.some((c) => c.mobile === "title")
  let temStatus = columns.some((c) => c.mobile === "status")
  let metas = columns.filter((c) => c.mobile === "meta").length
  for (const c of columns) {
    if (c.mobile) papeis.set(c.id, c.mobile)
    else if (!temTitulo) {
      temTitulo = true
      papeis.set(c.id, "title")
    } else if (!temStatus && amostra !== undefined && ehStatusBadge(c.cell(amostra))) {
      temStatus = true
      papeis.set(c.id, "status")
    } else if (metas < 2) {
      metas++
      papeis.set(c.id, "meta")
    } else papeis.set(c.id, "hidden")
  }
  return papeis
}

/** `title` só quando a célula é texto: de um `ReactNode` não dá para tirar. */
function tituloDe(conteudo: React.ReactNode): string | undefined {
  return typeof conteudo === "string" || typeof conteudo === "number" ? String(conteudo) : undefined
}

function pararClique(e: React.MouseEvent) {
  e.stopPropagation()
}

function MenuDaLinha({ acoes }: { acoes: DataTableRowAction[] }) {
  if (acoes.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Mais ações" onClick={pararClique}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      {/* O menu é um portal, mas o clique sobe pela árvore do React até a linha. */}
      <DropdownMenuContent align="end" onClick={pararClique}>
        {acoes.map(({ id, label, icon: Icon, onSelect, variant, disabled }) => (
          <DropdownMenuItem key={id} variant={variant} disabled={disabled} onSelect={onSelect}>
            {Icon ? <Icon aria-hidden="true" /> : null}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  sort,
  onSortChange,
  selection,
  onSelectionChange,
  pagination,
  state = "ready",
  toolbar,
  bulkActions,
  rowActions,
  renderMobileCard,
  empty,
  onClearFilters,
  emptyState,
  error,
  onRetry,
  errorState,
  density = "default",
  stickyHeader = true,
  className,
  "aria-label": ariaLabel,
}: DataTableProps<T>) {
  const acimaDeSm = useAboveSm()
  const idBase = React.useId()
  const idSelecionar = `${idBase}-selecionar`

  // Mais linhas que uma página só existe na paginação no cliente.
  const noCliente = !!pagination && rows.length > pagination.pageSize
  const visiveis = noCliente
    ? rows.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    : rows

  const totalDePaginas = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1

  // tickets/059 §3: a página atual deixou de existir (o total caiu) → volta para a 1.
  const paginaAtual = pagination?.page
  const irParaPagina = pagination?.onPageChange
  React.useEffect(() => {
    if (state === "loading" || paginaAtual === undefined || !irParaPagina) return
    if (paginaAtual > totalDePaginas) irParaPagina(1)
  }, [state, paginaAtual, totalDePaginas, irParaPagina])

  const modo: Exclude<DataTableState, "ready"> | "rows" =
    state === "loading" || state === "error" || state === "empty"
      ? state
      : visiveis.length === 0
        ? "empty"
        : "rows"

  const selecionavel = !!onSelectionChange
  const selecionados = new Set(selection ?? [])
  const idsVisiveis = visiveis.map((row, i) => getRowId(row, i))
  const quantosVisiveisSelecionados = idsVisiveis.filter((id) => selecionados.has(id)).length
  const todosSelecionados = idsVisiveis.length > 0 && quantosVisiveisSelecionados === idsVisiveis.length

  const alternarLinha = (id: string, marcar: boolean) => {
    const atual = selection ?? []
    onSelectionChange?.(marcar ? [...atual, id] : atual.filter((x) => x !== id))
  }
  const alternarTodas = () => {
    const atual = selection ?? []
    onSelectionChange?.(
      todosSelecionados
        ? atual.filter((id) => !idsVisiveis.includes(id))
        : [...atual, ...idsVisiveis.filter((id) => !selecionados.has(id))]
    )
  }

  const papeis = papeisNoCelular(columns, visiveis[0])
  const colunaTitulo = columns.find((c) => papeis.get(c.id) === "title")

  const conteudoDaCelula = (col: DataTableColumn<T>, row: T, idTitulo?: string) => {
    const conteudo = col.cell(row)
    const titulo = tituloDe(conteudo)
    // A linha inteira é clicável pelo mouse; é este botão que dá teclado e leitor de tela.
    if (col === colunaTitulo && onRowClick) {
      return (
        <button
          type="button"
          id={idTitulo}
          title={titulo}
          onClick={(e) => {
            e.stopPropagation()
            onRowClick(row)
          }}
          className={cn("block w-full truncate rounded-sm text-left font-medium text-foreground", FOCO)}
        >
          {conteudo}
        </button>
      )
    }
    return (
      <span id={idTitulo} title={titulo} className="block truncate">
        {conteudo}
      </span>
    )
  }

  const vazio = emptyState ?? (
    <EmptyState
      title={EMPTY_TITLE}
      {...empty}
      action={
        empty?.action ??
        (onClearFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            {CLEAR_FILTERS_LABEL}
          </Button>
        ) : undefined)
      }
    />
  )
  const falha = errorState ?? <ErrorState {...error} onRetry={onRetry} />

  const barraDeSelecao =
    selecionavel && selecionados.size > 0 ? (
      <div
        data-slot="data-table-selection"
        className="flex flex-wrap items-center gap-2 border-b bg-accent px-3 py-2 text-label text-accent-foreground"
      >
        <span aria-live="polite">
          {selecionados.size === 1
            ? "1 item selecionado"
            : `${formatarNumero(selecionados.size)} itens selecionados`}
        </span>
        <span className="flex-1" />
        {bulkActions}
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelectionChange?.([])}>
          Limpar seleção
        </Button>
      </div>
    ) : null

  const rodape =
    pagination && modo === "rows" && pagination.total > 0 ? (
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-body-sm text-muted-foreground">
        <p aria-live="polite">
          Mostrando {formatarNumero(Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total))}
          –{formatarNumero(Math.min(pagination.page * pagination.pageSize, pagination.total))} de{" "}
          {formatarNumero(pagination.total)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {pagination.pageSizeOptions && pagination.onPageSizeChange ? (
            <div className="flex items-center gap-2">
              <span id={`${idBase}-por-pagina`}>Por página</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(v) => pagination.onPageSizeChange?.(Number(v))}
              >
                <SelectTrigger aria-labelledby={`${idBase}-por-pagina`} className="w-20 sm:h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pagination.pageSizeOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <PaginationControls
            page={pagination.page}
            totalPages={totalDePaginas}
            onPageChange={pagination.onPageChange}
          />
        </div>
      </div>
    ) : null

  const rotuloSelecionar = (
    <span id={idSelecionar} hidden>
      Selecionar
    </span>
  )

  const raiz = (modoDaRaiz: "table" | "cards", conteudo: React.ReactNode) => (
    <div
      data-slot="data-table"
      data-mode={modoDaRaiz}
      aria-busy={modo === "loading" || undefined}
      className={cn("w-full rounded-lg border bg-card text-card-foreground", className)}
    >
      {toolbar ? <div className="flex flex-wrap items-center gap-2 border-b p-3">{toolbar}</div> : null}
      {barraDeSelecao}
      {selecionavel ? rotuloSelecionar : null}
      {conteudo}
      {rodape}
    </div>
  )

  /* ---------------- Abaixo de 768: cartões ---------------- */
  if (!acimaDeSm) {
    const metas = columns.filter((c) => papeis.get(c.id) === "meta")
    const colunaStatus = columns.find((c) => papeis.get(c.id) === "status")

    return raiz(
      "cards",
      <>
        {modo === "loading" ? <TableSkeleton layout="cards" /> : null}
        {modo === "error" ? falha : null}
        {modo === "empty" ? vazio : null}
        {modo === "rows" ? (
          <ul>
            {visiveis.map((row, i) => {
              const id = idsVisiveis[i]
              const idTitulo = `${idBase}-titulo-${i}`
              const selecionada = selecionados.has(id)
              const acoes = rowActions?.(row) ?? []
              return (
                <li
                  key={id}
                  data-row-key={id}
                  data-state={selecionada ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "flex flex-col gap-1.5 border-b px-4 py-3 last:border-b-0 hover:bg-page",
                    selecionada && "bg-accent hover:bg-accent",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {selecionavel ? (
                      <span className="flex h-6 items-center">
                        <Checkbox
                          onClick={pararClique}
                          checked={selecionada}
                          onCheckedChange={(v) => alternarLinha(id, v === true)}
                          {...(renderMobileCard
                            ? { "aria-label": `Selecionar linha ${i + 1}` }
                            : { "aria-labelledby": `${idSelecionar} ${idTitulo}` })}
                        />
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      {renderMobileCard ? (
                        renderMobileCard(row)
                      ) : colunaTitulo ? (
                        <div className="text-body font-semibold text-foreground">
                          {conteudoDaCelula(colunaTitulo, row, idTitulo)}
                        </div>
                      ) : null}
                    </div>
                    {acoes.length > 0 ? (
                      <span className="-my-2 shrink-0">
                        <MenuDaLinha acoes={acoes} />
                      </span>
                    ) : null}
                  </div>
                  {!renderMobileCard && metas.length > 0 ? (
                    <p data-mobile-role="meta" className="text-body-sm text-muted-foreground">
                      {metas.map((col, j) => (
                        <React.Fragment key={col.id}>
                          {j > 0 ? " · " : null}
                          <span data-column-id={col.id}>{col.cell(row)}</span>
                        </React.Fragment>
                      ))}
                    </p>
                  ) : null}
                  {!renderMobileCard && colunaStatus ? (
                    <div data-mobile-role="status" data-column-id={colunaStatus.id}>
                      {colunaStatus.cell(row)}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </>
    )
  }

  /* ---------------- Tabela ---------------- */
  const totalDeColunas = columns.length + (selecionavel ? 1 : 0) + (rowActions ? 1 : 0)
  const cabecalhoFixo = stickyHeader && "sticky top-0 z-sticky bg-card"

  return raiz(
    "table",
    // `table-fixed` + largura no `<th>`: a tabela não "dança" ao trocar de página, e o
    // skeleton ocupa o lugar exato dos dados. O preço é truncar texto longo.
    <table aria-label={ariaLabel} className="w-full table-fixed caption-bottom text-body text-foreground">
      <TableHeader>
        {/* `<tr>` simples: o TableRow traz hover, e cabeçalho não reage a hover. */}
        <tr className="border-b">
          {selecionavel ? (
            <TableHead className={cn("w-10", cabecalhoFixo)}>
              <Checkbox
                aria-label="Selecionar todas as linhas"
                disabled={modo !== "rows"}
                checked={
                  todosSelecionados ? true : quantosVisiveisSelecionados > 0 ? "indeterminate" : false
                }
                onCheckedChange={alternarTodas}
              />
            </TableHead>
          ) : null}
          {columns.map((col) => {
            const ativa = !!col.sortable && sort?.columnId === col.id
            const alinhamento = col.align ?? "left"
            const Seta = !ativa ? ChevronsUpDown : sort?.direction === "asc" ? ChevronUp : ChevronDown
            return (
              <TableHead
                key={col.id}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                // `aria-sort` só em coluna ordenável: "none" numa que nunca ordena promete o que não existe.
                aria-sort={
                  !col.sortable
                    ? undefined
                    : !ativa
                      ? "none"
                      : sort?.direction === "asc"
                        ? "ascending"
                        : "descending"
                }
                className={cn(
                  ALINHAMENTO[alinhamento],
                  ativa && "text-foreground",
                  cabecalhoFixo,
                  col.className
                )}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    data-sort-id={col.id}
                    onClick={() => onSortChange?.(proximoSort(col.id, sort))}
                    className={cn(
                      "inline-flex w-full items-center gap-1 rounded-sm",
                      JUSTIFICA[alinhamento],
                      FOCO
                    )}
                  >
                    <span className="truncate">{col.header}</span>
                    <Seta aria-hidden="true" className="size-3.5 shrink-0" />
                  </button>
                ) : (
                  <span className="block truncate">{col.header}</span>
                )}
              </TableHead>
            )
          })}
          {rowActions ? (
            <TableHead className={cn("w-12", cabecalhoFixo)}>
              <span className="sr-only">Ações</span>
            </TableHead>
          ) : null}
        </tr>
      </TableHeader>

      <TableBody>
        {modo === "loading" ? (
          <TableSkeleton
            columns={[
              ...(selecionavel ? [""] : []),
              ...columns.map((c) => c.className ?? ""),
              ...(rowActions ? [""] : []),
            ]}
            rowClassName={ALTURA[density]}
          />
        ) : null}
        {modo === "error" ? (
          <tr>
            <td colSpan={totalDeColunas}>{falha}</td>
          </tr>
        ) : null}
        {modo === "empty" ? (
          <tr>
            <td colSpan={totalDeColunas}>{vazio}</td>
          </tr>
        ) : null}
        {modo === "rows"
          ? visiveis.map((row, i) => {
              const id = idsVisiveis[i]
              const idTitulo = `${idBase}-titulo-${i}`
              const selecionada = selecionados.has(id)
              return (
                <TableRow
                  key={id}
                  data-row-key={id}
                  data-state={selecionada ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(ALTURA[density], onRowClick && "cursor-pointer")}
                >
                  {selecionavel ? (
                    <TableCell className="py-0" onClick={pararClique}>
                      <Checkbox
                        aria-labelledby={`${idSelecionar} ${idTitulo}`}
                        checked={selecionada}
                        onCheckedChange={(v) => alternarLinha(id, v === true)}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      data-column-id={col.id}
                      className={cn("py-0", ALINHAMENTO[col.align ?? "left"], col.className)}
                    >
                      {conteudoDaCelula(col, row, col === colunaTitulo ? idTitulo : undefined)}
                    </TableCell>
                  ))}
                  {rowActions ? (
                    <TableCell className="py-0 text-right" onClick={pararClique}>
                      <MenuDaLinha acoes={rowActions(row)} />
                    </TableCell>
                  ) : null}
                </TableRow>
              )
            })
          : null}
      </TableBody>
    </table>
  )
}

export { DataTable }
