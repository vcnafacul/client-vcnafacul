import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

/** 8 linhas ocupam a dobra sem virar uma parede pulsando. */
export const TABLE_SKELETON_ROWS = 8

export interface TableSkeletonProps {
  /**
   * `rows`: `<tr>`s para um `<tbody>`, com as mesmas colunas da tabela (a largura
   * vem do `<th>`, e nada salta quando os dados chegam). `cards`: blocos, para a
   * tabela em cartões e para listas.
   */
  layout?: "rows" | "cards"
  /** Só em `rows`: quantas colunas, ou uma classe por coluna (por exemplo a visibilidade). */
  columns?: number | string[]
  rows?: number
  rowClassName?: string
  cellClassName?: string
}

function TableSkeleton({
  layout = "rows",
  columns = 1,
  rows = TABLE_SKELETON_ROWS,
  rowClassName,
  cellClassName,
}: TableSkeletonProps) {
  const linhas = Array.from({ length: rows }, (_, i) => i)

  if (layout === "cards") {
    return (
      <>
        {linhas.map((i) => (
          <div
            key={i}
            data-testid="table-skeleton-row"
            className={cn("space-y-2 border-b px-4 py-3", rowClassName)}
          >
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </>
    )
  }

  const colunas = typeof columns === "number" ? Array.from({ length: columns }, () => "") : columns
  return (
    <>
      {linhas.map((i) => (
        <tr key={i} data-testid="table-skeleton-row" className={cn("h-10", rowClassName)}>
          {colunas.map((classe, j) => (
            <td key={j} className={cn("px-3", cellClassName, classe)}>
              <Skeleton className="h-3.5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export { Skeleton, TableSkeleton }
