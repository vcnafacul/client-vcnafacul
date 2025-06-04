import { attendanceRecord } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { toBrazilStartOfDayISOString } from "@/utils/toBrazilISOString";

export async function createAttendanceRecord(token: string, classId: string, date: Date, studentIds: string[] ): Promise<void> {
  const dateBR = toBrazilStartOfDayISOString(date);
  const body = JSON.stringify({ classId, date: dateBR, studentIds });
  console.log(body);
  const response = await fetchWrapper(attendanceRecord, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
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
