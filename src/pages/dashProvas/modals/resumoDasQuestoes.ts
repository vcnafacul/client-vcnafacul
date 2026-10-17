/** "90 questões · 1 anulada" — ou só o total quando não há anulada (tickets/042). */
export function resumoDasQuestoes(total: number, anuladas: number) {
  const q = `${total} ${total === 1 ? "questão" : "questões"}`;
  if (!anuladas) return q;
  return `${q} · ${anuladas} ${anuladas === 1 ? "anulada" : "anuladas"}`;
}
