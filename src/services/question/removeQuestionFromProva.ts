import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function removeQuestionFromProva(
  questaoId: string,
  provaId: string,
  token: string
): Promise<void> {
  const response = await fetchWrapper(
    `${questoes}/${questaoId}/provas/${provaId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status !== StatusCodes.OK) {
    const res = await response.json().catch(() => ({}));
    throw new Error(`Erro ao remover questão da prova - ${res.message ?? ""}`);
  }
}
