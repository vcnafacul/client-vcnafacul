import { declarationSurvey } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function submitSurvey(
  areaInterest: string[],
  selectedCourses: string[],
  studentId: string,
  token: string,
) {
  const response = await fetchWrapper(declarationSurvey, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, areaInterest, selectedCourses }),
  });

  if (!response.ok) {
    let message = "Erro ao enviar pesquisa. Tente novamente.";
    try {
      const data = await response.json();
      if (data?.message && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(message);
  }
}
