import { subscribers } from "@/services/urls";
import {
  StudentCourseFullDtoInput,
  XLSXStudentCourseFull,
} from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getSubscribers(
  token: string,
  inscriptionId: string
): Promise<XLSXStudentCourseFull[]> {
  const response = await fetchWrapper(`${subscribers}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    const data: StudentCourseFullDtoInput[] = await response.json();
    return data.map((student) => {
      return {
        ...student,
        cadastrado_em: new Date(student.cadastrado_em),
        data_convocacao: student.data_convocacao
          ? new Date(student.data_convocacao!.split("Z")[0])
          : null,
        data_limite_convocacao: student.data_limite_convocacao
          ? new Date(student.data_limite_convocacao!.split("Z")[0])
          : null,
        socioeconomic: JSON.parse(student.socioeconomic),
      };
    });
  }

  throw new Error(`Erro ao tentar estudantes inscritos`);
}
