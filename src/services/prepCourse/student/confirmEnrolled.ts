import { studentCourse } from "@/services/urls";

export async function confirmEnrolled(studentId: string, classId: string, token: string) {
  const response = await fetch(
    `${studentCourse}/confirm-enrolled/${studentId}/class/${classId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status === 500) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
