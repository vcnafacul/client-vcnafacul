import { classes } from "@/services/urls";
import { ClassToAttendanceRecord } from "@/types/partnerPrepCourse/classToAttendanceRecord";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getStudentsToAttendanceRecord(token: string, id: string): Promise<ClassToAttendanceRecord> {
  const response = await fetchWrapper(`${classes}/${id}/attendance-record`, {
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
