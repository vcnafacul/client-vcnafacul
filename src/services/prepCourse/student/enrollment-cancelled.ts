import { studentCourse } from "@/services/urls";

export async function enrollmentCancelled(
  studentId: string,
  reason: string,
  token: string
) {
  const response = await fetch(`${studentCourse}/enrollment-cancelled`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, reason }),
  });
  if (response.status === 500) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
  if ([400, 404].includes(response.status)) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
