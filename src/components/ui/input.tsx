import * as React from "react"

import { cn } from "@/lib/utils"

// tickets/059 §3 e D21: borda `input`, h-11 no celular e h-9 a partir de 768,
// ícones nas pontas e unidade (`suffix`) no fim.
export const controlRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const plano =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-body transition-colors file:border-0 file:bg-transparent file:text-body file:font-semibold file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-destructive sm:h-9"

const casca =
  "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-body transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-muted has-[[aria-invalid=true]]:border-destructive sm:h-9"

const interno =
  "h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"

const encaixe = "flex shrink-0 items-center text-muted-foreground [&_svg]:size-4"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Ícone no começo do campo. */
  leading?: React.ReactNode
  /** Ícone ou botão de ícone (`ghost`, com `aria-label`) no fim do campo. */
  trailing?: React.ReactNode
  /** Unidade depois do valor, por exemplo "% de faltas". */
  suffix?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leading, trailing, suffix, ...props }, ref) => {
    if (!leading && !trailing && !suffix) {
      return (
        <input
          type={type}
          className={cn(plano, controlRing, className)}
          ref={ref}
          {...props}
        />
      )
    }
    return (
      <div className={cn(casca, className)}>
        {leading ? <span className={encaixe}>{leading}</span> : null}
        <input type={type} className={interno} ref={ref} {...props} />
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
Input.displayName = "Input"

export { Input }
