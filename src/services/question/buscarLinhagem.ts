import fetchWrapper from "@/utils/fetchWrapper";
import { questoes } from "../urls";

/** Uma linha da aba Linhagem: o que identifica a questão para quem olha. */
export interface ItemDaLinhagem {
  id: string;
  /** `StatusEnum`: 0 pendente, 1 aprovada, 2 rejeitada. */
  status: number;
  congelada: boolean;
  /** O começo do enunciado, numa linha — truncado no servidor. */
  enunciado: string;
  /** Em quantas provas está. */
  provas: number;
}

export interface LinhagemDaQuestao {
  atual: string;
  /** Da mais antiga à mais nova, com a atual dentro. Vazia sem versões. */
  versoes: ItemDaLinhagem[];
  /** Cópias DIRETAS desta questão. */
  copias: ItemDaLinhagem[];
  /** De quem esta é cópia, se for. */
  origemCopia: ItemDaLinhagem | null;
}

/**
 * A linhagem da questão (card 34A).
 *
 * ⚠️ **Substitui o `listarCopias` do card 25**: um endpoint para a relação
 * inteira, e não dois que saem de acordo no primeiro que mudar.
 */
export async function buscarLinhagem(
  token: string,
  questaoId: string,
): Promise<LinhagemDaQuestao> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/linhagem`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar a linhagem da questão");
  }
  return await response.json();
}
