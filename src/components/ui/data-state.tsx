import * as React from "react"
import { AlertCircle, Inbox, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "./button"

// Estados vazio e de erro compartilhados por DataTable, List e Timeline (tickets/059 §3, D20).

export interface EmptyStateProps {
  icon?: LucideIcon
  title: React.ReactNode
  hint?: React.ReactNode
  /** Por exemplo "Limpar filtros" ou "Nova prova". */
  action?: React.ReactNode
  className?: string
}

/** O que falta + por quê + uma ação (§6). */
function EmptyState({ icon: Icon = Inbox, title, hint, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}
    >
      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-h4 text-foreground">{title}</p>
      {hint ? <p className="text-body-sm text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export const ERROR_TITLE = "Não foi possível carregar os dados."
export const ERROR_MESSAGE = "Verifique sua conexão e tente de novo."
export const RETRY_LABEL = "Tentar de novo"

export interface ErrorStateProps {
  title?: React.ReactNode
  message?: React.ReactNode
  /** Sem ele não há botão: um "Tentar de novo" que não faz nada é pior que nenhum. */
  onRetry?: () => void
  className?: string
}

/**
 * Erro que bloqueia a lista: alerta inline + "Tentar de novo" (§6, Errors).
 * Mesmo visual do `Alert` `destructive`.
 */
function ErrorState({
  title = ERROR_TITLE,
  message = ERROR_MESSAGE,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("p-4", className)}>
      <div
        role="alert"
        data-slot="error-state"
        className="flex items-start gap-3 rounded-lg bg-destructive-muted px-4 py-3"
      >
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-body font-semibold text-destructive">{title}</p>
          {message ? <p className="text-body-sm text-foreground">{message}</p> : null}
        </div>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {RETRY_LABEL}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export { EmptyState, ErrorState }
