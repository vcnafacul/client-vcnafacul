import { attendanceRecord } from "@/services/urls";
import { AttendanceRecord } from "@/types/partnerPrepCourse/attendanceRecord";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getAttendanceRecordByStudentId(token: string, id: string, studentId: string): Promise<AttendanceRecord[]> {
  const response = await fetchWrapper(`${attendanceRecord}/${id}/student/${studentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res : AttendanceRecord[] = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return res;
}
