import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { formatarData } from "@/lib/datasBr"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { EmptyState, ErrorState, type EmptyStateProps, type ErrorStateProps } from "./data-state"
import { TableSkeleton } from "./skeleton"
import type { StatusVariant } from "./status-badge"

// D18: histórico de eventos. Uma lista ordenada, com a ligação entre um evento e o próximo.

const MARCADOR: Record<StatusVariant, string> = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  destructive: "bg-destructive-muted text-destructive",
  info: "bg-info-muted text-info",
  neutral: "bg-muted text-muted-foreground",
}

export interface TimelineItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, "children"> {
  icon: LucideIcon
  variant: StatusVariant
  who: React.ReactNode
  what: React.ReactNode
  when: Date
  detail?: React.ReactNode
  action?: { label: string; onClick: () => void }
  /** Posto pela `Timeline`: o último evento não tem linha de ligação. */
  isLast?: boolean
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ icon: Icon, variant, who, what, when, detail, action, isLast, className, ...props }, ref) => (
    <li ref={ref} className={cn("relative flex gap-3", !isLast && "pb-6", className)} {...props}>
      {!isLast ? (
        <span
          data-slot="timeline-connector"
          aria-hidden="true"
          className="absolute bottom-0 left-4 top-8 w-px -translate-x-1/2 bg-border"
        />
      ) : null}
      <span
        className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", MARCADOR[variant])}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1 pt-1.5">
        <p className="text-body text-foreground">
          <span className="font-semibold">{who}</span> <span>{what}</span>
        </p>
        <time dateTime={when.toISOString()} className="block text-caption text-muted-foreground">
          {formatarData(when, "dd/MM/yyyy 'às' HH:mm")}
        </time>
        {detail ? (
          <div className="rounded-md bg-muted px-3 py-2 text-body-sm text-foreground">{detail}</div>
        ) : null}
        {action ? (
          <div className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  )
)
TimelineItem.displayName = "TimelineItem"

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  state?: "loading" | "empty" | "error" | "ready"
  onRetry?: () => void
  empty?: EmptyStateProps
  error?: Pick<ErrorStateProps, "title" | "message">
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ state = "ready", onRetry, empty, error, className, children, ...props }, ref) => {
    if (state === "loading") {
      return (
        <div aria-busy="true" className={className}>
          <span className="sr-only">Carregando</span>
          <TableSkeleton layout="cards" rows={4} rowClassName="border-b-0" />
        </div>
      )
    }
    if (state === "error") return <ErrorState {...error} onRetry={onRetry} className={className} />
    if (state === "empty") {
      return <EmptyState title="Nenhum evento ainda" {...empty} className={className} />
    }

    const itens = React.Children.toArray(children).filter(React.isValidElement)
    return (
      <ol ref={ref} className={cn("flex flex-col", className)} {...props}>
        {itens.map((item, i) =>
          React.cloneElement(item as React.ReactElement<TimelineItemProps>, {
            isLast: i === itens.length - 1,
          })
        )}
      </ol>
    )
  }
)
Timeline.displayName = "Timeline"

export { Timeline, TimelineItem }
