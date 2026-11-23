import * as React from "react"
import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { doDiaDoCalendario, formatarData, paraDiaDoCalendario } from "@/lib/datasBr"
import { Calendar } from "./calendar"
import { controlRing } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export const gatilhoDeData =
  "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-body transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-destructive sm:h-9 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

export interface DatePickerProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "value" | "onChange" | "defaultValue"
  > {
  value?: Date
  onChange: (value: Date | undefined) => void
  placeholder?: string
  /** Datas fora do intervalo ficam desabilitadas. */
  min?: Date
  max?: Date
  /** Injetado pelo `Field`; o gatilho é um `button`, então só `aria-required` vale. */
  required?: boolean
  /**
   * `"dropdown"` troca o título do mês por seletores de mês e ano (data muito
   * distante, como a de nascimento). Pede `startMonth` e `endMonth`.
   */
  captionLayout?: "label" | "dropdown"
  startMonth?: Date
  endMonth?: Date
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Selecionar data",
      min,
      max,
      captionLayout,
      startMonth,
      endMonth,
      className,
      disabled,
      // `required` não vale em <button>: o Field já põe aria-required
      required: _required,
      ...props
    },
    ref
  ) => {
    void _required
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
            <span className={cn(!value && "text-muted-foreground")}>
              {value ? formatarData(value) : placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="z-popover w-auto p-0">
          <Calendar
            mode="single"
            captionLayout={captionLayout}
            startMonth={startMonth}
            endMonth={endMonth}
            selected={value ? paraDiaDoCalendario(value) : undefined}
            defaultMonth={value ? paraDiaDoCalendario(value) : undefined}
            onSelect={(dia) => {
              onChange(dia ? doDiaDoCalendario(dia) : undefined)
              setAberto(false)
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
DatePicker.displayName = "DatePicker"

export { DatePicker }
