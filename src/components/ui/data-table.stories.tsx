import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "./button"
import { DataTable, type DataTableColumn, type DataTableSort } from "./data-table"
import { Input } from "./input"
import { StatusBadge, type StatusVariant } from "./status-badge"

// Quando usar DataTable, Table ou List: Uso/DataTable.
interface Prova {
  id: string
  nome: string
  ano: number
  questoes: string
  status: [StatusVariant, string]
}

const STATUS: [StatusVariant, string][] = [
  ["success", "Concluída"],
  ["destructive", "Faltando questões"],
  ["warning", "Em andamento"],
  ["info", "Agendada"],
  ["neutral", "Rascunho"],
]

const PROVAS: Prova[] = Array.from({ length: 45 }, (_, i) => ({
  id: String(i + 1),
  nome: i % 3 === 0 ? `ENEM ${2010 + (i % 15)} — 1ª aplicação` : `Simulado Nacional ${i + 1}`,
  ano: 2010 + (i % 15),
  questoes: `${180 - (i % 7) * 10}/180`,
  status: STATUS[i % STATUS.length],
}))

const COLUNAS: DataTableColumn<Prova>[] = [
  { id: "nome", header: "Prova", cell: (r) => r.nome, sortable: true },
  { id: "ano", header: "Ano", cell: (r) => r.ano, align: "right", sortable: true, width: "96px" },
  { id: "questoes", header: "Questões", cell: (r) => r.questoes, align: "right", width: "120px" },
  {
    id: "status",
    header: "Status",
    width: "180px",
    cell: (r) => <StatusBadge variant={r.status[0]}>{r.status[1]}</StatusBadge>,
  },
]

const ACOES = () => [
  { id: "editar", label: "Editar prova", icon: Pencil, onSelect: () => {} },
  { id: "excluir", label: "Excluir prova", icon: Trash2, variant: "destructive" as const, onSelect: () => {} },
]

const meta = {
  title: "Componentes/DataTable",
  component: DataTable<Prova>,
  tags: ["autodocs"],
  args: {
    columns: COLUNAS,
    rows: PROVAS.slice(0, 5),
    getRowId: (r: Prova) => r.id,
  },
  argTypes: {
    state: { control: "inline-radio", options: ["ready", "loading", "empty", "error"] },
    density: { control: "inline-radio", options: ["default", "compact"] },
  },
} satisfies Meta<typeof DataTable<Prova>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Compact: Story = { args: { density: "compact" } }
export const WithRowActions: Story = { args: { rowActions: ACOES } }
export const Loading: Story = { args: { state: "loading" } }
export const Empty: Story = {
  args: {
    rows: [],
    empty: { title: "Nenhuma prova encontrada", hint: "Tente outros filtros ou crie uma nova prova." },
    onClearFilters: () => {},
  },
}
export const Error: Story = { args: { state: "error", onRetry: () => {} } }

function Completa() {
  const [sort, setSort] = useState<DataTableSort>({ columnId: "nome", direction: "asc" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selection, setSelection] = useState<string[]>(["2", "3"])
  // A tabela não ordena: a tela ordena (aqui, em memória) e a tabela pagina no cliente.
  const ordenadas = [...PROVAS].sort((a, b) => {
    const [x, y] = sort.columnId === "ano" ? [a.ano, b.ano] : [a.nome, b.nome]
    const r = x < y ? -1 : x > y ? 1 : 0
    return sort.direction === "asc" ? r : -r
  })
  return (
    <DataTable
      columns={COLUNAS}
      rows={ordenadas}
      getRowId={(r) => r.id}
      sort={sort}
      onSortChange={(s) => {
        setSort(s)
        setPage(1)
      }}
      selection={selection}
      onSelectionChange={setSelection}
      bulkActions={
        <>
          <Button variant="ghost" size="sm">
            <Download aria-hidden="true" />
            Exportar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2 aria-hidden="true" />
            Excluir
          </Button>
        </>
      }
      rowActions={ACOES}
      pagination={{
        page,
        pageSize,
        total: ordenadas.length,
        onPageChange: setPage,
        pageSizeOptions: [10, 25, 50],
        onPageSizeChange: (n) => {
          setPageSize(n)
          setPage(1)
        },
      }}
      toolbar={
        <>
          <div className="relative min-w-40 flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Buscar prova" placeholder="Buscar prova…" className="pl-9" />
          </div>
          <Button variant="cta">
            <Plus aria-hidden="true" />
            Nova prova
          </Button>
        </>
      }
    />
  )
}

export const Full: Story = { render: () => <Completa /> }

// No celular as linhas viram cartões: título, meta "2019 · 180/180" e o status.
export const MobileCards: Story = {
  args: { rowActions: ACOES, selection: ["1"], onSelectionChange: () => {} },
  globals: { viewport: { value: "mobile", isRotated: false } },
}

// `isRowSelectable`: a caixa da prova 2 fica desabilitada, e a do cabeçalho só marca as outras.
export const SelecaoRestrita: Story = {
  args: {
    selection: [],
    onSelectionChange: () => {},
    isRowSelectable: (r) => r.id !== "2",
  },
}
