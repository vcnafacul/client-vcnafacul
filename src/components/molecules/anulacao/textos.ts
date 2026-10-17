export const TITULO_ANULAR = "Anular questão nesta prova";
export const TITULO_EDITAR = "Editar anulação";

/** O que acontece ao anular, dito antes de confirmar (tickets/042, D2 e D6). */
export function textoDoEfeito(numero: number | null) {
  const q = numero != null ? `A questão ${numero}` : "A questão";
  return `${q} fica fora da análise desta prova: nota e relatórios. Os resultados já calculados só mudam quando alguém pedir o recálculo no relatório.`;
}
