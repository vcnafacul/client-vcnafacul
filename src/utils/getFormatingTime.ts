export function getFormatingTime(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const leftMinutes = minutes - hours * 60
    return `${hours}h ${leftMinutes} min`
  }