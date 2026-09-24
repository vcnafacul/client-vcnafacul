/** "cartao-2026001.jpg" — pela matrícula, que é como a secretaria arquiva. */
export function nomeDaFoto(matricula: string, tipo: string): string {
  const extensao =
    tipo === "image/png" ? "png" : tipo === "application/pdf" ? "pdf" : "jpg";
  const base = matricula.trim().replace(/[^\w-]+/g, "_") || "estudante";
  return `cartao-${base}.${extensao}`;
}
