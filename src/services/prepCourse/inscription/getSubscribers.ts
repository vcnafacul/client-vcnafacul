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
      const log = student.logs
        .filter((log) => log.description === "Email de convocação enviado")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      const logDate: Date | undefined = log?.createdAt
        ? new Date(log?.createdAt)
        : undefined;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const sended_email_recently: boolean =
        logDate != undefined && logDate.getTime() > oneHourAgo.getTime();

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
        sended_email_recently: sended_email_recently,
      };
    });
  }

  throw new Error(`Erro ao tentar estudantes inscritos`);
}
