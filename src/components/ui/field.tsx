import * as React from "react"
import { XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface FieldProps {
  label: React.ReactNode
  /** Ajuda abaixo do controle. Some quando há `error`. */
  hint?: React.ReactNode
  /** Mensagem de erro: texto neutro com ícone vermelho, o controle ganha borda `destructive`. */
  error?: React.ReactNode
  /** `*` vermelho no rótulo, mais `required` e `aria-required` no controle. */
  required?: boolean
  /** Mostra o contador "n/máx" e repassa `maxLength` ao controle (D21). */
  maxLength?: number
  /** Um único controle (Input, Textarea, SelectTrigger, Combobox…). */
  children: React.ReactElement<Record<string, unknown>>
  className?: string
}

function tamanhoDe(valor: unknown): number {
  return typeof valor === "string" || typeof valor === "number"
    ? String(valor).length
    : 0
}

/**
 * Envolve todo controle de formulário e liga `id`, `aria-describedby`,
 * `aria-invalid` e `aria-required` a ele (tickets/059 §3).
 */
function Field({
  label,
  hint,
  error,
  required,
  maxLength,
  children,
  className,
}: FieldProps) {
  const base = React.useId()
  const controle = children.props
  const id = (controle.id as string | undefined) ?? `${base}-controle`
  const idHint = `${base}-hint`
  const idErro = `${base}-erro`

  const [digitado, setDigitado] = React.useState(() =>
    tamanhoDe(controle.value ?? controle.defaultValue)
  )
  const tamanho =
    controle.value !== undefined ? tamanhoDe(controle.value) : digitado

  const descricao =
    [error ? idErro : hint ? idHint : null, controle["aria-describedby"]]
      .filter(Boolean)
      .join(" ") || undefined

  const controleLigado = React.cloneElement(children, {
    id,
    "aria-describedby": descricao,
    ...(error ? { "aria-invalid": true } : {}),
    ...(required ? { required: true, "aria-required": true } : {}),
    ...(maxLength !== undefined ? { maxLength } : {}),
  })

  return (
    <div
      className={cn("grid gap-1.5", className)}
      onChange={(e) => {
        if (maxLength === undefined) return
        const alvo = e.target as HTMLInputElement
        setDigitado(alvo.value.length)
      }}
    >
      <Label htmlFor={id} className="text-label">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {controleLigado}
      {error || hint || maxLength !== undefined ? (
        <div className="flex items-start justify-between gap-2 text-caption text-muted-foreground">
          {error ? (
            <p id={idErro} className="flex items-center gap-1.5">
              <XCircle
                aria-hidden="true"
                className="size-3.5 shrink-0 text-destructive"
              />
              {error}
            </p>
          ) : hint ? (
            <p id={idHint}>{hint}</p>
          ) : (
            <span />
          )}
          {maxLength !== undefined ? (
            <span className="ml-auto shrink-0 tabular-nums">
              {tamanho}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/** "* obrigatório", uma vez por formulário. */
function FormLegend({ className }: { className?: string }) {
  return (
    <p className={cn("text-caption text-muted-foreground", className)}>
      * obrigatório
    </p>
  )
}

export { Field, FormLegend }
