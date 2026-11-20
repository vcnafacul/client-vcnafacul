import * as React from "react"

import { cn } from "@/lib/utils"

import { EmptyState, ErrorState, type EmptyStateProps, type ErrorStateProps } from "./data-state"
import { TableSkeleton } from "./skeleton"

// D20: lista sem colunas, ordenação nem seleção. Estados iguais aos da DataTable.

export type ListState = "loading" | "empty" | "error" | "ready"

export interface ListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  state?: ListState
  onRetry?: () => void
  empty?: EmptyStateProps
  error?: Pick<ErrorStateProps, "title" | "message">
  /** Quantas linhas de skeleton enquanto carrega. */
  loadingRows?: number
  children?: React.ReactNode
}

const LIST_EMPTY_TITLE = "Nada por aqui ainda"

const List = React.forwardRef<HTMLUListElement, ListProps>(
  (
    { state = "ready", onRetry, empty, error, loadingRows = 5, className, children, ...props },
    ref
  ) => {
    if (state === "loading") {
      return (
        <div aria-busy="true" className={className}>
          <span className="sr-only">Carregando</span>
          <TableSkeleton layout="cards" rows={loadingRows} />
        </div>
      )
    }
    if (state === "error") {
      return <ErrorState {...error} onRetry={onRetry} className={className} />
    }
    if (state === "empty") {
      return <EmptyState title={LIST_EMPTY_TITLE} {...empty} className={className} />
    }
    return (
      <ul ref={ref} className={cn("divide-y divide-border", className)} {...props}>
        {children}
      </ul>
    )
  }
)
List.displayName = "List"

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "title"> {
  title: React.ReactNode
  /** Informações secundárias, unidas por " · ". */
  meta?: React.ReactNode[]
  badges?: React.ReactNode
  /** Ações, ou um `SegmentedControl size="sm"`. */
  trailing?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ title, meta, badges, trailing, className, ...props }, ref) => {
    const metas = (meta ?? []).filter((m) => m !== null && m !== undefined && m !== false && m !== "")
    return (
      <li
        ref={ref}
        className={cn("flex min-h-11 items-center gap-3 px-4 py-2 sm:min-h-10", className)}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 truncate text-body font-medium text-foreground">{title}</span>
            {badges}
          </div>
          {metas.length > 0 ? (
            <p data-slot="list-item-meta" className="text-body-sm text-muted-foreground">
              {metas.map((m, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? " · " : null}
                  {m}
                </React.Fragment>
              ))}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
      </li>
    )
  }
)
ListItem.displayName = "ListItem"

export { List, ListItem }
