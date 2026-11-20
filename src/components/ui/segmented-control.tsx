import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cva } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// D17: escolhe um valor entre 2 e 5 opções curtas, ali mesmo. Aba troca conteúdo.
const itemVariants = cva(
  "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm border border-transparent px-3 text-button text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-border data-[state=checked]:bg-background data-[state=checked]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-7",
        md: "h-9 sm:h-7",
      },
    },
    defaultVariants: { size: "md" },
  }
)

export interface SegmentedOption {
  value: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
}

export interface SegmentedControlProps {
  value: string
  onValueChange: (value: string) => void
  options: SegmentedOption[]
  size?: "sm" | "md"
  fullWidth?: boolean
  /** Nome do grupo para o leitor de tela. Obrigatório. */
  "aria-label": string
  disabled?: boolean
  className?: string
}

const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  SegmentedControlProps
>(
  (
    { value, onValueChange, options, size = "md", fullWidth, className, ...props },
    ref
  ) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      loop
      className={cn(
        "inline-flex rounded-md bg-muted p-1",
        fullWidth && "flex w-full",
        className
      )}
      {...props}
    >
      {options.map(({ value: v, label, icon: Icon, disabled }) => (
        <RadioGroupPrimitive.Item
          key={v}
          value={v}
          disabled={disabled}
          // Enter no radio não envia o formulário ao redor (o Radix já cancela o keydown).
          className={itemVariants({ size })}
        >
          {Icon ? <Icon aria-hidden="true" /> : null}
          {label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
)
SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
