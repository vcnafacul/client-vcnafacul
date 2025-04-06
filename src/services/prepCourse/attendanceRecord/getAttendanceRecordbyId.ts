import { attendanceRecord } from "@/services/urls";
import { AttendanceRecord } from "@/types/partnerPrepCourse/attendanceRecord";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getAttendanceRecordById(token: string, id: string): Promise<AttendanceRecord> {
  const response = await fetchWrapper(`${attendanceRecord}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res : AttendanceRecord = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return res;
}
