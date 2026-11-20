
import { cn } from "@/lib/utils"

import { Alert } from "./alert"
import { Button } from "./button"

// D19: lista o que impede salvar quando o campo com erro pode estar fora da vista.
// Soma aos erros dos campos, nunca os substitui. Num Dialog vai no `banner`.

export interface ErrorSummaryItem {
  message: string
  /** Onde o campo está, por exemplo "aba Alternativas". */
  where?: string
  /** Troca de aba ou etapa e põe o foco no campo. */
  onGoTo: () => void
}

export interface ErrorSummaryProps {
  items: ErrorSummaryItem[]
  className?: string
}

function ErrorSummary({ items, className }: ErrorSummaryProps) {
  if (items.length === 0) return null
  const title =
    items.length === 1 ? "1 problema impede salvar" : `${items.length} problemas impedem salvar`
  return (
    <Alert data-slot="error-summary" variant="destructive" title={title} className={cn(className)}>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-2">
            <span>{item.message}</span>
            {item.where ? <span className="text-muted-foreground">{item.where}</span> : null}
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={item.onGoTo}>
              Ir até o campo
            </Button>
          </li>
        ))}
      </ul>
    </Alert>
  )
}

export { ErrorSummary }
