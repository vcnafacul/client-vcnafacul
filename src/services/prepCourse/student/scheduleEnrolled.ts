import { studentCourse } from "@/services/urls";

export async function scheduleEnrolled(
  inscriptionId: string,
  data_start: Date,
  data_end: Date,
  token: string
) {
  const response = await fetch(`${studentCourse}/schedule-enrolled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ inscriptionId, data_start, data_end }),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status === 500) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
