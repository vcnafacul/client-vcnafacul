export function toCamelPermission(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}
