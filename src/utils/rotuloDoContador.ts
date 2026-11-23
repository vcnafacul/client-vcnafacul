/** "9+" acima de 9: o sino é pequeno. */
export function rotuloDoContador(n: number): string | null {
  if (n <= 0) return null;
  return n > 9 ? "9+" : String(n);
}
