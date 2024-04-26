import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function deleteQuestion(id: string, token: string) {
  const response = await fetchWrapper(`${questoes}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== StatusCodes.OK) {
    let errorMessage = "Erro ao tentar criar questão";
    if (response.status >= StatusCodes.BAD_REQUEST) {
      errorMessage += (await response.json()).message as string;
    }
    throw new Error(errorMessage);
  }
}
