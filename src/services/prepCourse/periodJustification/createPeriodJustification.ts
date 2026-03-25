import { periodJustification } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

interface CreatePeriodJustificationInput {
  studentCourseId: string;
  startDate: string;
  endDate: string;
  justification: string;
}

export async function createPeriodJustification(
  token: string,
  data: CreatePeriodJustificationInput,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await fetchWrapper(periodJustification, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const res = await response.json();
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Um erro inesperado ocorreu");
  }
  return res;
}
