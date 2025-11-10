import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

/**
 * Interface para atualização de classificação da questão
 * Endpoint: PATCH /api/questions/:id/classification
 */
export interface UpdateClassificationData {
  _id: string;
  prova: string;
  numero: number;
  enemArea: string;
  materia: string;
  frente1: string;
  frente2?: string;
  frente3?: string;
  provaClassification: boolean;
  subjectClassification: boolean;
  reported: boolean;
}

/**
 * Atualiza apenas a classificação de uma questão
 * @param data - Dados de classificação a serem atualizados
 * @param token - Token de autenticação
 * @returns Promise<void>
 * @throws Error se a atualização falhar
 */
export async function updateClassification(
  data: UpdateClassificationData,
  token: string
): Promise<void> {
  const { _id, ...body } = data;

  // Converter numero para number se vier como string
  if (typeof body.numero === "string") {
    body.numero = parseInt(body.numero, 10);
  }

  const response = await fetchWrapper(`${questoes}/${_id}/classification`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status !== StatusCodes.OK) {
    let errorMessage = "Erro ao atualizar classificação";
    if (response.status >= StatusCodes.BAD_REQUEST) {
      const res = await response.json();
      errorMessage += ` - ${res.message}`;
    }
    throw new Error(errorMessage);
  }
}

