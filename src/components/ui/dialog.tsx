import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type DialogSize = "sm" | "md" | "lg" | "full"

// O tamanho pode vir do Dialog (raiz) ou do DialogContent; o do conteúdo vence.
const DialogSizeContext = React.createContext<DialogSize>("md")

function Dialog({
  size = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & { size?: DialogSize }) {
  return (
    <DialogSizeContext.Provider value={size}>
      <DialogPrimitive.Root {...props} />
    </DialogSizeContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-overlay bg-foreground/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// tickets/059 D21: abaixo de 768 o Dialog é tela cheia; de 768 em diante, altura máxima calc(100dvh-2rem).
const dialogVariants = cva(
  "fixed left-[50%] top-[50%] z-overlay flex w-full translate-x-[-50%] translate-y-[-50%] flex-col gap-4 border bg-background p-6 text-foreground shadow-lg duration-200 sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl max-sm:left-0 max-sm:top-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      size: {
        sm: "max-w-[400px]",
        md: "max-w-form",
        lg: "max-w-[800px]",
        full: "sm:h-[calc(100dvh-2rem)] sm:max-w-[calc(100vw-2rem)]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-header"
    className={cn("flex shrink-0 flex-col space-y-1.5 text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/** Contêiner que rola. O `DialogContent` já embrulha o que não for cabeçalho nem rodapé; use direto para controlar o corpo. */
const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-body"
    className={cn("min-h-0 flex-1 overflow-y-auto", className)}
    {...props}
  />
)
DialogBody.displayName = "DialogBody"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Texto de estado à esquerda, anunciado pelo leitor de tela ("12 presentes · 3 ausentes"). */
  status?: React.ReactNode
}

// Abaixo de 768 os botões empilham em largura total, com a ação principal (último filho) por cima.
const DialogFooter = ({
  className,
  status,
  children,
  ...props
}: DialogFooterProps) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "flex shrink-0 flex-col-reverse gap-2 max-sm:[&>button]:w-full sm:flex-row sm:items-center sm:justify-end",
      className
    )}
    {...props}
  >
    {status !== undefined ? (
      <div
        aria-live="polite"
        className="text-body-sm text-muted-foreground sm:mr-auto"
      >
        {status}
      </div>
    ) : null}
    {children}
  </div>
)
DialogFooter.displayName = "DialogFooter"

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: DialogSize
  /** Fixo logo abaixo do cabeçalho: resumo de erros e avisos. */
  banner?: React.ReactNode
}

// Separa cabeçalho e rodapé do resto: só o resto (o corpo) rola.
function repartir(children: React.ReactNode) {
  const cabecalho: React.ReactNode[] = []
  const rodape: React.ReactNode[] = []
  const corpo: React.ReactNode[] = []
  React.Children.toArray(children).forEach((filho) => {
    const tipo = React.isValidElement(filho) ? filho.type : null
    if (tipo === DialogHeader) cabecalho.push(filho)
    else if (tipo === DialogFooter) rodape.push(filho)
    else corpo.push(filho)
  })
  return { cabecalho, rodape, corpo }
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, banner, ...props }, ref) => {
  const sizeDoDialog = React.useContext(DialogSizeContext)
  const { cabecalho, rodape, corpo } = repartir(children)
  const corpoPronto =
    corpo.length === 1 &&
    React.isValidElement(corpo[0]) &&
    corpo[0].type === DialogBody ? (
      corpo[0]
    ) : corpo.length > 0 ? (
      <DialogBody className="grid content-start gap-4">{corpo}</DialogBody>
    ) : null
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogVariants({ size: size ?? sizeDoDialog }), className)}
        {...props}
      >
        {cabecalho}
        {banner ? (
          <div data-slot="dialog-banner" className="shrink-0">
            {banner}
          </div>
        ) : null}
        {corpoPronto}
        {rodape}
        <DialogPrimitive.Close asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Fechar"
            className="absolute right-3 top-3"
          >
            <X />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("pr-10 text-h3 text-foreground", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
