import { Question } from "@/dtos/question/questionDTO";
import fetchWrapper from "@/utils/fetchWrapper";
import { questoes } from "../urls";

/**
 * Congela a questão e cria a sucessora já editada (card 26/27).
 *
 * ⚠️ **As provas e simulados passam a apontar a nova** — é o que distingue isto
 * de `duplicarQuestao`, onde a cópia nasce órfã e nada muda de lugar.
 *
 * ⚠️ O corpo é o MESMO do `updateContent`: o conteúdo novo é escrito na
 * sucessora, não na original.
 */
export async function novaVersaoQuestao(
  token: string,
  questaoId: string,
  conteudo: Record<string, unknown>,
): Promise<Question> {
  const response = await fetchWrapper(
    `${questoes}/${questaoId}/nova-versao`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(conteudo),
    },
  );

  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Erro ao criar a nova versão da questão");
  }
  return await response.json();
}
