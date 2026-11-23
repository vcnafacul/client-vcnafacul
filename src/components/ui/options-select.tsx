import * as React from "react"

import { Combobox } from "./combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export interface SelectOption<T extends string | number = string | number> {
  value: T
  label: string
}

/** Acima disto a lista vira `Combobox` (com busca), como manda a §7.4 da spec 059. */
export const SELECT_SEARCH_THRESHOLD = 10

export interface OptionsSelectProps<T extends string | number> {
  options: SelectOption<T>[]
  value?: T | null
  /** Devolve o valor da opção com o tipo original (número continua número). */
  onValueChange: (value: T) => void
  placeholder?: string
  /**
   * Estado vazio: texto, ou função do que foi digitado na busca (só no `Combobox`).
   * Sem opções, o `Select` mostra o texto no lugar da lista.
   */
  emptyText?: React.ReactNode | ((busca: string) => React.ReactNode)
  disabled?: boolean
  id?: string
  className?: string
  "aria-describedby"?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean
  "aria-required"?: boolean
  /** Injetado pelo `Field`; o gatilho é um `button`, então só `aria-required` vale. */
  required?: boolean
}

function OptionsSelectInner<T extends string | number>(
  {
    options,
    value,
    onValueChange,
    placeholder = "Selecione",
    emptyText,
    disabled,
    id,
    className,
    required: _required,
    ...aria
  }: OptionsSelectProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  void _required
  const current =
    value === undefined || value === null || value === ""
      ? undefined
      : String(value)
  // O Radix não aceita item com valor vazio: a opção vazia vira o placeholder.
  const items = options.filter((o) => String(o.value) !== "")
  const pick = (text: string) => {
    const option = items.find((o) => String(o.value) === text)
    if (option) onValueChange(option.value)
  }

  if (items.length > SELECT_SEARCH_THRESHOLD) {
    return (
      <Combobox
        ref={ref}
        id={id}
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        emptyText={emptyText}
        options={items.map((o) => ({ value: String(o.value), label: o.label }))}
        value={current}
        onValueChange={pick}
        {...aria}
      />
    )
  }

  return (
    <Select value={current ?? ""} onValueChange={pick} disabled={disabled}>
      <SelectTrigger ref={ref} id={id} className={className} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-body-sm text-muted-foreground">
            {typeof emptyText === "function"
              ? emptyText("")
              : (emptyText ?? "Nenhuma opção disponível")}
          </p>
        ) : null}
        {items.map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Escolha única para dentro de um `Field`: `Select` do Radix, ou `Combobox`
 * quando a lista é longa. Repassa ao gatilho o que o `Field` injeta
 * (`id`, `aria-*`) e o `ref`. Os dois abrem em portal e funcionam dentro de um Dialog.
 */
const OptionsSelect = React.forwardRef(OptionsSelectInner) as <
  T extends string | number,
>(
  props: OptionsSelectProps<T> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactElement

export { OptionsSelect }
