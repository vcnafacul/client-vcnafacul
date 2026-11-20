import { startOfDay } from "date-fns"
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
