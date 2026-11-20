import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { Spinner } from "./spinner"

// tickets/059 §3: densidade adaptativa, h-11 abaixo de 768 e h-9 a partir dele.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        cta: "bg-cta text-cta-foreground hover:brightness-[0.88]",
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        // Apelido de `primary` até a limpeza (R14).
        default: "bg-primary text-primary-foreground hover:brightness-110",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        outline:
          "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-[0.88]",
        link: "text-primary underline underline-offset-4 hover:brightness-90",
      },
      size: {
        sm: "h-8 px-3 text-label",
        md: "h-11 px-4 sm:h-9",
        // Apelido de `md` até a limpeza (R14).
        default: "h-11 px-4 sm:h-9",
        lg: "h-11 px-6",
        icon: "h-11 w-11 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type ButtonBaseProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> &
  Omit<VariantProps<typeof buttonVariants>, "size"> & {
    asChild?: boolean
    /** Mostra o spinner e desabilita o botão. Ignorado o spinner com `asChild`. */
    loading?: boolean
  }

// Botão só de ícone não tem texto: o nome acessível é obrigatório no tipo.
export type ButtonProps = ButtonBaseProps &
  (
    | { size?: "sm" | "md" | "default" | "lg" }
    | { size: "icon"; "aria-label": string }
  )

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <Spinner size="button" decorative />
            ) : null}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
