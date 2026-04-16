import { summaryStudentCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { SummaryStudentCourse } from "./dtos/summary-student-course";

export async function getSummaryStudentCourse(
  token: string,
): Promise<SummaryStudentCourse> {
  const response = await fetchWrapper(summaryStudentCourse, {
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
