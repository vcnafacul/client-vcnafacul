import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";
import { AnulacaoInput } from "@/dtos/question/anulacao";
import { lerErro } from "../anulacao/anularQuestao";

/**
 * ⚠️ tickets/042 (D4): questão anulada em outra prova volta com 409
 * `QUESTAO_ANULADA` e a lista — o erro sai como `ErroDaAnulacao`, com o corpo,
 * para a tela abrir o aviso. Reenviar com `modo` decide.
 */
export async function addQuestionToProva(
  questaoId: string,
  provaId: string,
  numero: number,
  token: string,
  entrada?: { modo: "normal" | "anulada"; anulacao?: AnulacaoInput },
): Promise<void> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/provas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ provaId, numero, ...(entrada ?? {}) }),
  });

  if (!response.ok) {
    const erro = await lerErro(response, "");
    if (erro.code !== "QUESTAO_ANULADA") {
      erro.message = `Erro ao adicionar questão à prova - ${erro.message}`;
    }
    throw erro;
  }
}
