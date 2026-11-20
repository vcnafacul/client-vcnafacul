import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale/pt-BR"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// react-day-picker v9 com rótulos em pt-BR. Selecionado = primary, intervalo = accent,
// hoje = anel de 1px `input` (tickets/059 §3).
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      labels={{
        labelPrevious: () => "Mês anterior",
        labelNext: () => "Próximo mês",
      }}
      classNames={{
        root: "w-fit text-body",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "grid gap-2",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "text-label capitalize",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
        button_previous:
          "inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9",
        button_next:
          "inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday:
          "grid h-7 w-11 place-items-center text-caption font-semibold text-muted-foreground sm:w-9",
        week: "mt-0.5 flex",
        day: "relative p-0 text-center text-body-sm",
        day_button:
          "grid h-11 w-11 place-items-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9",
        selected:
          "[&>button]:bg-primary [&>button]:font-bold [&>button]:text-primary-foreground [&>button:hover]:bg-primary",
        today: "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-input",
        outside: "text-muted-foreground opacity-60",
        disabled: "cursor-not-allowed opacity-40",
        hidden: "invisible",
        range_start: "rounded-l-md bg-accent",
        range_end: "rounded-r-md bg-accent",
        range_middle:
          "bg-accent [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-accent-foreground [&>button]:font-normal",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: cls }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", cls)} aria-hidden="true" />
          ) : (
            <ChevronRight className={cn("size-4", cls)} aria-hidden="true" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
