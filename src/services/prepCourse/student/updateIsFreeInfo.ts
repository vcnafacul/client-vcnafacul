import { studentCourse } from "@/services/urls";

export async function updateIsFreeInfo(
  idStudentCourse: string,
  isFree: boolean,
  token: string
) {
  const response = await fetch(`${studentCourse}/update-is-free`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idStudentCourse, isFree }),
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
