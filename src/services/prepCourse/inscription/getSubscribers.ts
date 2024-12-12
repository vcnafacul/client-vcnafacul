import { subscribers } from "@/services/urls";
import {
  StudentCourseFullDtoInput,
  XLSXStudentCourseFull,
} from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

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
      const formattedDateEnrolled = student.data_convocacao
        ? formatInTimeZone(
            student.data_convocacao.split("T")[0],
            "America/Sao_Paulo",
            "dd/MM/yyyy",
            {
              locale: ptBR,
            }
          )
        : null;
      const formattedDateLimit = student.data_limite_convocacao
        ? formatInTimeZone(
            student.data_limite_convocacao.split("T")[0],
            "America/Sao_Paulo",
            "dd/MM/yyyy",
            {
              locale: ptBR,
            }
          )
        : null;

      return {
        ...student,
        cadastrado_em: new Date(student.cadastrado_em),
        data_convocacao: formattedDateEnrolled,
        data_limite_convocacao: formattedDateLimit,
        socioeconomic: JSON.parse(student.socioeconomic),
      };
    });
  }

  throw new Error(`Erro ao tentar estudantes inscritos`);
}
