import { studentAttendance } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateRegisterStudent(token: string,id: string, justification: string, present: boolean ): Promise<void> {
  const response = await fetchWrapper(`${studentAttendance}/present`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, justification, present }),
  });

  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Um erro inesperado ocorreu");
  }
}
