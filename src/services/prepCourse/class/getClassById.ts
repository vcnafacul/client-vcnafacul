import { classes } from "@/services/urls";
import { ClassEntityWithStudents } from "@/types/partnerPrepCourse/classEntity";
import fetchWrapper from "@/utils/fetchWrapper";

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
    throw new Error("Erro ao tentar deletar turma");
  }
  const res = await response.json();
  return {
    ...res,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: res.students.map((student: any) => {
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        applicationStatus: student.applicationStatus,
        cod_enrolled: student.cod_enrolled,
        photo: student.photo,
        birthday: new Date(student.birthday),
        logs: [],
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        socioeconomic: JSON.parse(student.socioeconomic),
        isFree: student.isFree,
        areaInterest: JSON.parse(student.areaInterest),
        selectedCourses: JSON.parse(student.selectedCourses),
      };
    }),
  };
}
