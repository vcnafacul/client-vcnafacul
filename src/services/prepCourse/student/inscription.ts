import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import { studentCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function completeInscriptionStudent(
  student: StudentInscriptionDTO,
  token: string
): Promise<void> {
  const response = await fetchWrapper(studentCourse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...student,
    }),
  });
  const res = await response.json();
  if (response.status !== 201) {
    throw new Error(res.message);
  }
}
