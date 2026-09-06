import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { classes } from "@/services/urls";
import { ClassEntityWithStudents } from "@/types/partnerPrepCourse/classEntity";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * O payload cru de `GET /class/:id`. Os nomes divergem dos do `ClassStudent`
 * — `status`, `created_at` e `updated_at` contra `applicationStatus`,
 * `createdAt` e `updatedAt` —, e o `.map` era tipado como `any`, entao a
 * leitura pelo nome errado devolvia `undefined` sem erro de compilacao nem de
 * runtime. Tipar o payload e o que impede o erro de voltar.
 */
interface StudentClassApiResponse {
  id: string;
  name: string;
  email: string;
  status: StatusApplication;
  cod_enrolled: string;
  photo: string;
  birthday: string;
  created_at: string;
  updated_at: string;
  socioeconomic: string;
  isFree: string;
  areaInterest: string;
  selectedCourses: string;
  presencePercentage?: number | null;
  absencePercentage?: number | null;
  justifiedAbsencePercentage?: number | null;
}

export async function getClassById(
  token: string,
  id: string
): Promise<ClassEntityWithStudents> {
  const response = await fetchWrapper(`${classes}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 200) {
    throw new Error("Erro ao buscar turma");
  }
  const res = await response.json();
  return {
    ...res,
    partnerId: res.partnerId || "",
    students: (res.students as StudentClassApiResponse[]).map((student) => {
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        applicationStatus: student.status,
        cod_enrolled: student.cod_enrolled,
        photo: student.photo,
        birthday: new Date(student.birthday),
        logs: [],
        createdAt: new Date(student.created_at),
        updatedAt: new Date(student.updated_at),
        socioeconomic: JSON.parse(student.socioeconomic),
        isFree: student.isFree,
        areaInterest: JSON.parse(student.areaInterest),
        selectedCourses: JSON.parse(student.selectedCourses),
        presencePercentage: student.presencePercentage ?? null,
        absencePercentage: student.absencePercentage ?? null,
        justifiedAbsencePercentage: student.justifiedAbsencePercentage ?? null,
      };
    }),
  };
}
