import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function setProvaBase(
  questaoId: string,
  provaId: string,
  token: string
): Promise<void> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/prova-base`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ provaId }),
  });

  if (response.status !== StatusCodes.OK) {
    const res = await response.json().catch(() => ({}));
    throw new Error(`Erro ao definir prova de origem - ${res.message ?? ""}`);
  }
}
