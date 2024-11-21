import { StatusEnum } from "@/enums/generic/statusEnum";
import { studentCourse } from "@/services/urls";

export async function updateApplicationStatus(
  idStudentCourse: string,
  applicationStatus: StatusEnum,
  token: string
) {
  const response = await fetch(`${studentCourse}/update-application-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idStudentCourse, applicationStatus }),
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
