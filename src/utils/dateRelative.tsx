import { DateTime } from "luxon";

export function DateRelative(date: string) {
  const currentDate = DateTime.now();
  const inputDate = DateTime.fromISO(date);
  const daysPassed = currentDate.diff(inputDate, "days").days;
  if (daysPassed < 7) return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_SHORT);
  return DateTime.now().plus({ days: -daysPassed }).toRelativeCalendar();

}
