import * as React from "react"

import { cn } from "@/lib/utils"
import { controlRing } from "./input"

const plano =
  "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-body transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-destructive"

const casca =
  "flex min-h-20 w-full items-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-body transition-colors has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-ring has-[textarea:focus-visible]:ring-offset-2 has-[textarea:focus-visible]:ring-offset-background has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-muted has-[:disabled]:opacity-60 has-[[aria-invalid=true]]:border-destructive"

const encaixe = "flex shrink-0 items-center text-muted-foreground [&_svg]:size-4"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Ícone no começo do campo. */
  leading?: React.ReactNode
  /** Ícone ou botão de ícone (`ghost`, com `aria-label`) no fim do campo. */
  trailing?: React.ReactNode
  /** Unidade depois do valor. */
  suffix?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, leading, trailing, suffix, ...props }, ref) => {
    if (!leading && !trailing && !suffix) {
      return (
        <textarea
          className={cn(plano, controlRing, className)}
          ref={ref}
          {...props}
        />
      )
    }
    return (
      <div className={cn(casca, className)}>
        {leading ? <span className={encaixe}>{leading}</span> : null}
        <textarea
          className="min-h-16 min-w-0 flex-1 resize-y bg-transparent text-body outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          ref={ref}
          {...props}
        />
        {suffix ? (
          <span className="shrink-0 text-body-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
        {trailing ? <span className={encaixe}>{trailing}</span> : null}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
