import { AttendanceRecordSummaryByStudent } from "@/dtos/attendanceRecord/attendanceRecordSummary";
import { attendanceRecord } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { format } from "date-fns";

export async function getSummaryByStudent(classId: string, startDate: Date, endDate: Date, token: string): Promise<AttendanceRecordSummaryByStudent> {
  const response = await fetchWrapper(`${attendanceRecord}/summarybystudent?classId=${classId}&startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return res;
}
