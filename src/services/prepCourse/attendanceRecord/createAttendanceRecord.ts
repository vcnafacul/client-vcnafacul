import { attendanceRecord } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function createAttendanceRecord(token: string, classId: string, date: Date, studentIds: string[] ): Promise<void> {
  const response = await fetchWrapper(attendanceRecord, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, date, studentIds }),
  });

  const res = await response.json();
  console.log(res);
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Um erro inesperado ocorreu");
  }
  return res;
}
