import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="Paginação"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

/**
 * Um `<button>` de verdade; só vira `<a>` com `href`. O `<a>` sem `href` de antes
 * não recebia foco pelo teclado (tickets/059 §3).
 */
type PaginationLinkProps = {
  isActive?: boolean
  size?: "sm" | "md" | "default" | "icon"
  href?: string
} & Omit<React.ComponentProps<"button">, "ref"> &
  Pick<React.ComponentProps<"a">, "target" | "rel">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  href,
  target,
  rel,
  type = "button",
  children,
  ...props
}: PaginationLinkProps) => {
  const classes = cn(
    buttonVariants({ variant: isActive ? "primary" : "ghost", size }),
    size === "icon" && "w-auto min-w-11 px-2 sm:w-auto sm:min-w-9",
    className
  )
  const ariaCurrent = isActive ? ("page" as const) : undefined
  if (href !== undefined) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        aria-current={ariaCurrent}
        className={classes}
        {...(props as React.ComponentProps<"a">)}
      >
        {children}
      </a>
    )
  }
  return (
    <button type={type} aria-current={ariaCurrent} className={classes} {...props}>
      {children}
    </button>
  )
}
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página anterior"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
    {/* No celular só a seta: com o texto a paginação passava da tela. */}
    <span className="hidden sm:inline">Anterior</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Próxima página"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span className="hidden sm:inline">Próxima</span>
    <ChevronRight aria-hidden="true" className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center text-muted-foreground", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Mais páginas</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

/** Páginas a mostrar: a primeira, a última, a atual e as vizinhas; o resto vira "…". */
function paginasVisiveis(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const meio = [page - 1, page, page + 1].filter((p) => p > 1 && p < totalPages)
  const saida: (number | "…")[] = [1]
  if (meio[0] > 2) saida.push("…")
  saida.push(...meio)
  if (meio[meio.length - 1] < totalPages - 1) saida.push("…")
  saida.push(totalPages)
  return saida
}

export interface PaginationControlsProps {
  /** 1-based. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** A paginação pronta: Anterior, as páginas (a atual em `primary`) e Próxima. */
function PaginationControls({ page, totalPages, onPageChange, className }: PaginationControlsProps) {
  if (totalPages <= 1) return null
  return (
    <Pagination className={cn("mx-0 w-auto", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        </PaginationItem>
        {paginasVisiveis(page, totalPages).map((p, i) =>
          p === "…" ? (
            <PaginationItem key={`e${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => onPageChange(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationControls,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
