import { studentAttendance } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function applyJustication(token: string, studentCourseId: string, attendanceRecordIds: string[], justification: string ): Promise<void> {
  const response = await fetchWrapper(`${studentAttendance}/justification`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentCourseId, justification, attendanceRecordIds }),
  });

  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Um erro inesperado ocorreu");
  }
}
