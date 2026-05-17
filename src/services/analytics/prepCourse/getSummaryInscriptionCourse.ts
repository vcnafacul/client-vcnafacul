import { summaryInscriptionCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { SummaryInscriptionCourse } from "./dtos/summary-inscription-course";

export async function getSummaryInscriptionCourse(
  token: string,
): Promise<SummaryInscriptionCourse> {
  const response = await fetchWrapper(summaryInscriptionCourse, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de cursinhos`);
  }

  return res;
}
