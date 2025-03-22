export function isCurrentDateBetween(startDate: Date, endDate: Date) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end;
}