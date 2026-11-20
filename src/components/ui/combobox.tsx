import * as React from "react"
import { Command } from "cmdk"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { controlRing } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "onChange" | "defaultValue"
  > {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** Só para o catálogo: abre a lista de saída. */
  defaultOpen?: boolean
}

// Substitui o `Autocomplete` do MUI: busca no meio de uma lista longa (tickets/059 §3).
const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Selecionar",
      searchPlaceholder = "Buscar…",
      emptyText = "Nada encontrado",
      defaultOpen,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [aberto, setAberto] = React.useState(defaultOpen ?? false)
    const idLista = React.useId()
    const escolhida = options.find((o) => o.value === value)

    return (
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={aberto}
            aria-controls={idLista}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-body transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-destructive sm:h-9",
              controlRing,
              className
            )}
            {...props}
          >
            <span className={cn("line-clamp-1", !escolhida && "text-muted-foreground")}>
              {escolhida?.label ?? placeholder}
            </span>
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-popover w-[var(--radix-popover-trigger-width)] rounded-lg p-0 shadow-md"
        >
          <Command>
            <div className="flex items-center gap-2 border-b px-3">
              <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="h-11 w-full bg-transparent text-body outline-none placeholder:text-muted-foreground sm:h-9"
              />
            </div>
            <Command.List id={idLista} className="max-h-64 overflow-y-auto p-1">
              <Command.Empty className="px-2 py-6 text-center text-body-sm text-muted-foreground">
                {emptyText}
              </Command.Empty>
              {options.map((o) => (
                <Command.Item
                  key={o.value}
                  value={o.value}
                  keywords={[o.label]}
                  disabled={o.disabled}
                  onSelect={() => {
                    onValueChange(o.value)
                    setAberto(false)
                  }}
                  className="relative flex min-h-11 cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-body outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground sm:min-h-8"
                >
                  {o.label}
                  {o.value === value ? (
                    <Check aria-hidden="true" className="absolute right-2 size-4" />
                  ) : null}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
Combobox.displayName = "Combobox"

export { Combobox }
