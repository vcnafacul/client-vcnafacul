import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

// tickets/059 §3: inline e button 16px, page 32px. Substitui MoonLoader, CircularProgress e Loader2 avulso.
const spinnerVariants = cva("animate-spin text-current", {
  variants: {
    size: {
      inline: "size-4",
      button: "size-4",
      page: "size-8",
    },
  },
  defaultVariants: { size: "inline" },
})

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Dentro de um botão o nome acessível é o do botão: escondido do leitor de tela. */
  decorative?: boolean
}

function Spinner({ size, className, decorative = false, ...props }: SpinnerProps) {
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "status", "aria-label": "Carregando" } as const)
  return (
    <Loader2
      data-slot="spinner"
      className={cn(spinnerVariants({ size }), className)}
      {...a11y}
      {...props}
    />
  )
}

export { Spinner, spinnerVariants }
