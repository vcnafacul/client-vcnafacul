import { Question } from "@/dtos/question/questionDTO";
import fetchWrapper from "@/utils/fetchWrapper";
import { questoes } from "../urls";

/**
 * Cria uma cópia editável da questão, com lastro (card 25).
 *
 * ⚠️ **A original não é tocada.** Duplicar é uma ação sobre a questão NOVA — e
 * é o que distingue isto de "versionar" (card 26): lá as provas passam a apontar
 * a sucessora; aqui elas não mudam.
 */
export async function duplicarQuestao(
  token: string,
  questaoId: string,
): Promise<Question> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/duplicar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Erro ao duplicar a questão");
  }
  return await response.json();
}
