import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

/**
 * Interface para atualização de conteúdo da questão
 * Endpoint: PATCH /api/questions/:id/content
 */
export interface UpdateContentData {
  _id: string;
  textoQuestao: string;
  pergunta?: string;
  textoAlternativaA: string;
  textoAlternativaB: string;
  textoAlternativaC: string;
  textoAlternativaD: string;
  textoAlternativaE: string;
  alternativa: string;
  textClassification: boolean;
  alternativeClassfication: boolean;
}

/**
 * Atualiza apenas o conteúdo de uma questão
 * @param data - Dados de conteúdo a serem atualizados
 * @param token - Token de autenticação
 * @returns Promise<void>
 * @throws Error se a atualização falhar
 */
export async function updateContent(
  data: UpdateContentData,
  token: string
): Promise<void> {
  const { _id, ...body } = data;

  const response = await fetchWrapper(`${questoes}/${_id}/content`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status !== StatusCodes.OK) {
    let errorMessage = "Erro ao atualizar conteúdo";
    if (response.status >= StatusCodes.BAD_REQUEST) {
      const res = await response.json();
      errorMessage += ` - ${res.message}`;
    }
    throw new Error(errorMessage);
  }
}

