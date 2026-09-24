/** Datas no fuso de São Paulo — o servidor manda UTC. */
export function dataBR(iso: string | null | undefined, comHora = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(comHora ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Sao_Paulo",
  });
}
