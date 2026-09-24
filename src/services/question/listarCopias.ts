import fetchWrapper from "@/utils/fetchWrapper";
import { questoes } from "../urls";

export interface CopiaDaQuestao {
  id: string;
  status: string;
  origem: string;
}

/**
 * As cópias diretas de uma questão.
 *
 * ⚠️ **Derivadas de `origem` no ms, não lidas de um array no documento.** A
 * decisão está registrada no schema: uma lista denormalizada de filhas é o
 * padrão que os cards 21 e 22 mostraram que erra.
 */
export async function listarCopias(
  token: string,
  questaoId: string,
): Promise<CopiaDaQuestao[]> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/copias`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Erro ao buscar as cópias da questão");
  }
  return await response.json();
}
