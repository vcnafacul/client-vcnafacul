import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function addQuestionToProva(
  questaoId: string,
  provaId: string,
  numero: number,
  token: string
): Promise<void> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/provas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ provaId, numero }),
  });

  if (
    response.status !== StatusCodes.OK &&
    response.status !== StatusCodes.CREATED
  ) {
    const res = await response.json().catch(() => ({}));
    throw new Error(`Erro ao adicionar questão à prova - ${res.message ?? ""}`);
  }
}
