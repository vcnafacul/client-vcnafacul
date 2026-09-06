import { classes } from "@/services/urls";
import { CancelledStudent } from "@/types/partnerPrepCourse/cancelledStudent";
import fetchWrapper from "@/utils/fetchWrapper";

interface CancelledStudentApiResponse {
  id: string;
  name: string;
  email: string;
  cod_enrolled: string;
  cancelledAt: string | null;
  justification: string | null;
}

export async function getCancelledStudentsByClassId(
  token: string,
  id: string
): Promise<CancelledStudent[]> {
  const response = await fetchWrapper(`${classes}/${id}/cancelled-students`, {
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
    throw new Error("Erro ao buscar matrículas canceladas");
  }
  const res: CancelledStudentApiResponse[] = await response.json();
  return res.map((student) => ({
    ...student,
    // o DataGrid ordena e formata a coluna como `date`, entao precisa de Date
    cancelledAt: student.cancelledAt ? new Date(student.cancelledAt) : null,
  }));
}
