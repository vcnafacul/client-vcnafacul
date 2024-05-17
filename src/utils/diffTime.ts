import { DateTime } from "luxon";

export function DiffTime(date: DateTime, hours: number) {
  return date < DateTime.now().minus({ hours: hours });
}