import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// tickets/059 §3: fundo `*-muted`, ícone + título na cor do status, mensagem em `foreground`, ação opcional.
const alertVariants = cva("flex items-start gap-3 rounded-lg px-4 py-3", {
  variants: {
    variant: {
      info: "bg-info-muted",
      success: "bg-success-muted",
      warning: "bg-warning-muted",
      destructive: "bg-destructive-muted",
    },
  },
  defaultVariants: { variant: "info" },
})

const TITLE_COLOR = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
} as const

const ICONS: Record<keyof typeof TITLE_COLOR, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title: React.ReactNode
  /** Corpo: texto ou, no ErrorSummary, uma lista. */
  children?: React.ReactNode
  /** Por exemplo o botão "Tentar de novo". */
  action?: React.ReactNode
  icon?: LucideIcon
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, title, children, action, icon, className, role, ...props }, ref) => {
    const tone = variant ?? "info"
    const Icon = icon ?? ICONS[tone]
    return (
      <div
        ref={ref}
        data-slot="alert"
        // Erro e aviso interrompem; info e sucesso só informam.
        role={role ?? (tone === "destructive" || tone === "warning" ? "alert" : "status")}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", TITLE_COLOR[tone])} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn("text-body font-semibold", TITLE_COLOR[tone])}>{title}</p>
          {children ? <div className="text-body-sm text-foreground">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert, alertVariants }
