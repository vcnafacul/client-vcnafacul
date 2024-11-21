import { studentCourse } from "@/services/urls";

export async function updateEnrolledInfo(
  idStudentCourse: string,
  enrolled: boolean,
  token: string
) {
  const response = await fetch(`${studentCourse}/update-enrolled`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idStudentCourse, enrolled }),
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
