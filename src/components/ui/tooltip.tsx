import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

// O Radix só abre o Tooltip com hover e foco. Aqui ele também abre ao toque (tickets/059 §3).
const TooltipToqueContext = React.createContext<{
  abrir: () => void
  aberto: React.MutableRefObject<boolean>
} | null>(null)

function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [interno, setInterno] = React.useState(defaultOpen)
  const open = openProp ?? interno
  const aberto = React.useRef(open)
  aberto.current = open
  const mudar = (o: boolean) => {
    setInterno(o)
    onOpenChange?.(o)
  }
  const abrir = () => mudar(true)
  return (
    <TooltipToqueContext.Provider value={{ abrir, aberto }}>
      <TooltipPrimitive.Root open={open} onOpenChange={mudar} {...props} />
    </TooltipToqueContext.Provider>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onClick, ...props }, ref) => {
  const toque = React.useContext(TooltipToqueContext)
  const estavaAberto = React.useRef(false)
  const foiToque = React.useRef(false)
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      onPointerDown={(e) => {
        foiToque.current = e.pointerType === "touch"
        estavaAberto.current = toque?.aberto.current ?? false
        onPointerDown?.(e)
      }}
      onClick={(e) => {
        onClick?.(e)
        // O Radix fecha no clique; reabrir num microtask vence esse fechamento.
        if (foiToque.current && !estavaAberto.current) {
          queueMicrotask(() => toque?.abrir())
        }
        foiToque.current = false
      }}
      {...props}
    />
  )
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-popover overflow-hidden rounded-md bg-primary px-3 py-1.5 text-caption text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
