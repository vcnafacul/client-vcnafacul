export function DiffTime(date: number, hours: number) {
  const now = new Date().getTime();
  return now - date > hours * 60 * 60 * 1000;
}
