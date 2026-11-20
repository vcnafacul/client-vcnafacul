import * as React from "react"
import { Inbox, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { Alert } from "./alert"
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
 * É o `Alert` `destructive` com a ação.
 */
function ErrorState({
  title = ERROR_TITLE,
  message = ERROR_MESSAGE,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("p-4", className)}>
      <Alert
        data-slot="error-state"
        variant="destructive"
        title={title}
        action={
          onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              {RETRY_LABEL}
            </Button>
          ) : null
        }
      >
        {message}
      </Alert>
    </div>
  )
}

export { EmptyState, ErrorState }
