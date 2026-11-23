import * as React from "react"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "./calendar"
import { doDiaDoCalendario, formatarData, paraDataValida, paraDiaDoCalendario } from "@/lib/datasBr"
import { gatilhoDeData } from "./date-picker"
import { controlRing } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export type { DateRange }

/** Datas inválidas (`new Date("")`) contam como vazio, como no `DatePicker`. */
function normalizar(v: DateRange | undefined): DateRange | undefined {
  const from = paraDataValida(v?.from)
  if (!from) return undefined
  return { from, to: paraDataValida(v?.to) }
}

function rotuloDoPeriodo(v: DateRange | undefined, vazio: string) {
  if (!v?.from) return vazio
  if (!v.to) return formatarData(v.from)
  const mesmoAno = formatarData(v.from, "yyyy") === formatarData(v.to, "yyyy")
  return `${formatarData(v.from, mesmoAno ? "dd/MM" : "dd/MM/yyyy")} – ${formatarData(v.to)}`
}

export interface DateRangePickerProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "onChange" | "defaultValue"
  > {
  value?: DateRange
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
  /** Datas fora do intervalo ficam desabilitadas. */
  min?: Date
  max?: Date
  /** Injetado pelo `Field`; o gatilho é um `button`, então só `aria-required` vale. */
  required?: boolean
}

const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    { value: valorBruto, onChange, placeholder = "Selecionar período", min, max, className, disabled, required: _required, ...props },
    ref
  ) => {
    void _required
    const value = normalizar(valorBruto)
    const [aberto, setAberto] = React.useState(false)
    return (
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(gatilhoDeData, controlRing, className)}
            {...props}
          >
            <CalendarDays aria-hidden="true" />
            <span className={cn(!value?.from && "text-muted-foreground")}>
              {rotuloDoPeriodo(value, placeholder)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="z-popover w-auto p-0">
          <Calendar
            mode="range"
            selected={
              value?.from
                ? {
                    from: paraDiaDoCalendario(value.from),
                    to: value.to ? paraDiaDoCalendario(value.to) : undefined,
                  }
                : undefined
            }
            defaultMonth={value?.from ? paraDiaDoCalendario(value.from) : undefined}
            // Primeiro toque marca o início; o segundo, no mesmo dia ou depois,
            // marca o fim e fecha. Um toque antes do início, ou com o período
            // completo, começa outro. (O `onSelect` do calendário não serve: ele
            // devolve o período de um dia só já no primeiro toque.)
            onSelect={(_, dia) => {
              const escolhido = doDiaDoCalendario(dia)
              const ordem = (d: Date) => formatarData(d, "yyyy-MM-dd")
              if (value?.from && !value.to && ordem(escolhido) >= ordem(value.from)) {
                onChange({
                  from: doDiaDoCalendario(paraDiaDoCalendario(value.from)),
                  to: escolhido,
                })
                setAberto(false)
                return
              }
              onChange({ from: escolhido, to: undefined })
            }}
            disabled={[
              ...(min ? [{ before: paraDiaDoCalendario(min) }] : []),
              ...(max ? [{ after: paraDiaDoCalendario(max) }] : []),
            ]}
          />
        </PopoverContent>
      </Popover>
    )
  }
)
DateRangePicker.displayName = "DateRangePicker"

// ---------------------------------------------------------------------------
// Movido de `dashV2/DashDateRangeFilter` (tickets/059 R15).
//
// ⚠️ **`<input type="date">` nativo, e não um calendário do Radix**: teclado e
// leitor de tela de graça, e nenhum Popover — cada montagem de Popover custa
// segundos de CPU no jsdom. Controlado, sem `key`: remontar descarta ordenação,
// página e rolagem.
// ---------------------------------------------------------------------------

export const TEXTO_INTERVALO_INVERTIDO =
  "A data final é anterior à inicial — o filtro não está sendo aplicado."

/** Os valores dos dois `<input type="date">`: `yyyy-mm-dd`, os dois opcionais. */
export interface DateStringRange {
  de?: string
  ate?: string
}

export interface DateRangeFieldsProps {
  /** O que se filtra, ex. "Inicia em". Visível, e prefixo dos rótulos de leitor de tela. */
  label: string
  /** Controlado: `yyyy-mm-dd`. O "Limpar filtros" da barra zera por aqui. */
  value: DateStringRange
  onChange: (v: DateStringRange) => void
}

export function DateRangeFields({ label, value, onChange }: DateRangeFieldsProps) {
  const idDoRotulo = React.useId()
  const idDoAviso = React.useId()
  const invertido = !!(value.de && value.ate && value.ate < value.de)

  const campo = (lado: "de" | "ate", rotulo: string) => (
    <label className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
      <span>{rotulo}</span>
      <input
        type="date"
        aria-label={`${label} — ${rotulo}`}
        aria-invalid={invertido || undefined}
        aria-describedby={invertido ? idDoAviso : undefined}
        value={value[lado] ?? ""}
        // O próprio seletor do navegador já não oferece o dia impossível
        min={lado === "ate" ? value.de : undefined}
        max={lado === "de" ? value.ate : undefined}
        onChange={(e) => onChange({ ...value, [lado]: e.target.value || undefined })}
        className={cn(
          "h-11 rounded-md border border-input bg-background px-2 text-body text-foreground aria-[invalid=true]:border-destructive sm:h-9",
          controlRing
        )}
      />
    </label>
  )

  return (
    <div role="group" aria-labelledby={idDoRotulo} className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span id={idDoRotulo} className="text-label text-foreground">
          {label}
        </span>
        {campo("de", "de")}
        {campo("ate", "até")}
      </div>
      {invertido ? (
        <p id={idDoAviso} role="alert" className="text-caption text-muted-foreground">
          {TEXTO_INTERVALO_INVERTIDO}
        </p>
      ) : null}
    </div>
  )
}

export { DateRangePicker }
