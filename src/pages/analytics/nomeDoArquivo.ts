/** Nome do CSV com o cursinho do recorte (tickets/044, card 07). */
export function nomeDoArquivo(base: string, cursinhoNome?: string): string {
  if (!cursinhoNome) return base;
  const slug = cursinhoNome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `${base}_${slug}`;
}
