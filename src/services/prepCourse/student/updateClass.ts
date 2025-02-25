import { studentCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateClass(
  studentId: string,
  classId: string,
  token: string
) {
  const response = await fetchWrapper(`${studentCourse}/class`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, classId }),
  });
  if (response.status === 500) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
  if ([400, 404].includes(response.status)) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
