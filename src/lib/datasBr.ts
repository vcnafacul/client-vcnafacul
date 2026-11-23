import { startOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"

// Datas do produto são sempre as de São Paulo (tickets/059 §3).
export const FUSO_DO_BRASIL = "America/Sao_Paulo"

/** O dia (no fuso de São Paulo) como um Date local, que é o que o calendário entende. */
export const paraDiaDoCalendario = (d: Date) => toZonedTime(d, FUSO_DO_BRASIL)

/** O dia escolhido no calendário como o instante da meia-noite em São Paulo. */
export const doDiaDoCalendario = (d: Date) =>
  fromZonedTime(startOfDay(d), FUSO_DO_BRASIL)

export const formatarData = (d: Date, formato = "dd/MM/yyyy") =>
  formatInTimeZone(d, FUSO_DO_BRASIL, formato)

/**
 * Os pares `[início, fim]` que os formulários guardam, e o `DateRange` do
 * calendário. Com só o início escolhido, o par tem um item.
 */
export const paraIntervalo = (par?: ReadonlyArray<Date | null | undefined> | null): DateRange | undefined =>
  par?.[0] ? { from: par[0], to: par[1] ?? undefined } : undefined

export const paraPar = (v?: DateRange): Date[] | undefined =>
  v?.from ? (v.to ? [v.from, v.to] : [v.from]) : undefined

/** Uma Date válida, ou undefined para vazio, "" e data inválida (nunca lança). */
export const paraDataValida = (v: unknown): Date | undefined => {
  if (v === null || v === undefined || v === "") return undefined
  const d = v instanceof Date ? v : new Date(v as string | number)
  return Number.isNaN(d.getTime()) ? undefined : d
}
