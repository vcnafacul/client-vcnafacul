import { studentCourse } from "@/services/urls";
import { XLSXStudentCourseFull } from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getDetailed(
  studentId: string,
  token: string
): Promise<XLSXStudentCourseFull> {
  const response = await fetchWrapper(`${studentCourse}/${studentId}/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar detalhes do estudante");
  }
  return {
    ...res,
    socioeconomic: JSON.parse(res.socioeconomic),
    data_convocacao: res.data_convocacao ? new Date(res.data_convocacao) : null,
    data_limite_convocacao: res.data_limite_convocacao
      ? new Date(res.data_limite_convocacao)
      : null,
  };
}
