import fetchWrapper from "@/utils/fetchWrapper";
import { section_form } from "../urls";

export interface ReorderQuestionsDto {
  questionIds: string[];
}

/**
 * Reordena as questões de uma seção
 * @param token - Token de autenticação
 * @param sectionId - ID da seção
 * @param questionIds - Array com os IDs das questões na nova ordem
 * @returns Promise<void>
 *
 * Exemplo de uso:
 * await reorderQuestions(token, "section123", ["q1", "q3", "q2"])
 *
 * Endpoint esperado no BFF: PATCH /section-form/:sectionId/questions/reorder
 * Body: { questionIds: ["q1", "q3", "q2"] }
 */
export async function reorderQuestions(
  token: string,
  sectionId: string,
  questionIds: string[]
): Promise<void> {
  const response = await fetchWrapper(
    `${section_form}/${sectionId}/reorder`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionIds }),
    }
  );

  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw new Error(res.message || "Erro ao reordenar questões");
    }
  }
}
