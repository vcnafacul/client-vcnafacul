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

/** "questão 45" / "questões 3 e 45" (tickets/042, card 16). */
export function listaDeQuestoes(numeros: number[]): string {
  if (numeros.length === 1) return `questão ${numeros[0]}`;
  return `questões ${numeros.slice(0, -1).join(", ")} e ${numeros[numeros.length - 1]}`;
}

/**
 * O que o aluno lê sobre a anulação no próprio resultado (tickets/042, D7/16).
 * `null` = nada anulado.
 */
export function avisoDoResultado(h: {
  divergente?: boolean;
  recalculadoEm?: string;
  numerosAnulados?: number[];
  totalConsiderado?: number;
  anuladasAgora: number[];
}): { tipo: "divergente" | "recalculado" | "anulada"; texto: string } | null {
  if (h.divergente && h.anuladasAgora.length) {
    const q = listaDeQuestoes(h.anuladasAgora);
    const foi = h.anuladasAgora.length === 1 ? "foi anulada" : "foram anuladas";
    return {
      tipo: "divergente",
      texto: `A ${q} ${foi}. Sua nota será atualizada quando o cursinho recalcular os resultados.`,
    };
  }
  const numeros = h.numerosAnulados ?? [];
  if (!numeros.length) return null;
  const q = listaDeQuestoes(numeros);
  if (h.recalculadoEm) {
    const d = new Date(h.recalculadoEm);
    const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { tipo: "recalculado", texto: `Nota atualizada em ${data}: ${q} ${numeros.length === 1 ? "anulada" : "anuladas"}.` };
  }
  return {
    tipo: "anulada",
    texto: `${numeros.length} ${numeros.length === 1 ? "questão anulada" : "questões anuladas"} (${numeros.join(", ")}): fora da nota.`,
  };
}

export const TEXTO_FORA_DA_ANALISE = "Fora da análise: não conta na nota nem nos relatórios.";
