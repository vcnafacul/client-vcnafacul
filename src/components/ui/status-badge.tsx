import * as React from "react"
import { cva } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StatusVariant = "success" | "warning" | "destructive" | "info" | "neutral"

// Status nunca usa laranja: laranja é `cta` e `highlight` (tickets/059 D21).
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-caption font-semibold",
  {
    variants: {
      look: { dot: "bg-muted text-foreground", tint: "" },
      variant: { success: "", warning: "", destructive: "", info: "", neutral: "" },
    },
    compoundVariants: [
      { look: "tint", variant: "success", className: "bg-success-muted text-success" },
      { look: "tint", variant: "warning", className: "bg-warning-muted text-warning" },
      { look: "tint", variant: "destructive", className: "bg-destructive-muted text-destructive" },
      { look: "tint", variant: "info", className: "bg-info-muted text-info" },
      { look: "tint", variant: "neutral", className: "bg-muted text-muted-foreground" },
    ],
    defaultVariants: { look: "dot", variant: "neutral" },
  }
)

const COR: Record<StatusVariant, { dot: string; icon: string }> = {
  success: { dot: "bg-success", icon: "text-success" },
  warning: { dot: "bg-warning", icon: "text-warning" },
  destructive: { dot: "bg-destructive", icon: "text-destructive" },
  info: { dot: "bg-info", icon: "text-info" },
  neutral: { dot: "bg-muted-foreground", icon: "text-muted-foreground" },
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StatusVariant
  /** `dot` dentro de tabelas e listas; `tint` sozinho e em páginas de detalhe. */
  look?: "dot" | "tint"
  /** Toma o lugar do ponto. */
  icon?: LucideIcon
  /** Número ao lado do rótulo, por exemplo "32%". */
  value?: React.ReactNode
}

const StatusBadgeBase = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ variant, look = "dot", icon: Icon, value, className, children, ...props }, ref) => {
    // O rótulo carrega o significado; a cor é reforço. Neutro em `tint` dispensa o ponto.
    const marcador = Icon ? (
      <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", COR[variant].icon)} />
    ) : look === "tint" && variant === "neutral" ? null : (
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", COR[variant].dot)} />
    )
    return (
      <span
        ref={ref}
        data-variant={variant}
        data-look={look}
        className={cn(badgeVariants({ look, variant }), className)}
        {...props}
      >
        {marcador}
        {children}
        {value != null ? <span className="tabular-nums">{value}</span> : null}
      </span>
    )
  }
)
StatusBadgeBase.displayName = "StatusBadge"

/** `mobileRole`: a DataTable reconhece a coluna de status pelo elemento da célula. */
const StatusBadge = Object.assign(StatusBadgeBase, { mobileRole: "status" as const })

export { StatusBadge, badgeVariants as statusBadgeVariants }
