import { format, isSameDay, subDays } from "date-fns";

/**
 * Data/hora de uma mensagem no fuso do dispositivo: "Hoje 17:39",
 * "Ontem 17:39" ou "30/09/2026 17:39".
 */
export function formatMessageTimestamp(date: Date, now = new Date()): string {
  const time = format(date, "HH:mm");
  if (isSameDay(date, now)) return `Hoje ${time}`;
  if (isSameDay(date, subDays(now, 1))) return `Ontem ${time}`;
  return `${format(date, "dd/MM/yyyy")} ${time}`;
}
