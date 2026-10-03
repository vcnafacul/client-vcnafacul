/** `parte ÷ todo` em %, com uma casa só quando faz diferença ("14%", "13,6%"). */
export function taxa(parte: number | null, todo: number | null): number | null {
  if (parte === null || todo === null || todo <= 0) return null;
  return Math.round((parte / todo) * 1000) / 10;
}

export function porcentagem(valor: number | null): string | null {
  return valor === null ? null : `${valor.toLocaleString("pt-BR")}%`;
}
