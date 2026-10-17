export const TITULO_ANULAR = "Anular questão nesta prova";
export const TITULO_EDITAR = "Editar anulação";

/** O que acontece ao anular, dito antes de confirmar (tickets/042, D2 e D6). */
export function textoDoEfeito(numero: number | null) {
  const q = numero != null ? `A questão ${numero}` : "A questão";
  return `${q} fica fora da análise desta prova: nota e relatórios. Os resultados já calculados só mudam quando alguém pedir o recálculo no relatório.`;
}

export const TITULO_AVISO_ANULADA = "Questão já anulada em outra prova";
export const tituloDoAviso = (n: number) =>
  `Esta questão foi anulada em ${n} ${n === 1 ? "prova" : "provas"}`;
export const seloDoBanco = (n: number) =>
  `Anulada em ${n} ${n === 1 ? "prova" : "provas"}`;

export const TITULO_CADERNO_ANULADAS = "Caderno com questão anulada";
/** "Esta prova tem 1 questão anulada (45)…" (tickets/042, D8). */
export function textoDoCaderno(numeros: number[]): string[] {
  const n = numeros.length;
  const lista = numeros.join(", ");
  return [
    n === 1
      ? `Esta prova tem 1 questão anulada (${lista}). Ela vai sair no caderno com o selo "QUESTÃO ANULADA: não responda".`
      : `Esta prova tem ${n} questões anuladas (${lista}). Elas vão sair no caderno com o selo "QUESTÃO ANULADA: não responda".`,
    "Para não imprimir, troque a questão na prova antes de gerar.",
  ];
}
