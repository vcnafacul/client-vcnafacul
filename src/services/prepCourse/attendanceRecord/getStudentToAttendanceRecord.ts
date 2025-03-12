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
  return {
    id: res.id,
    name: res.name,
    year: res.year,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: res.students.map((s: any) => ({
      id: s.id,
      name: s.user.firstName + " " + s.user.lastName,
      cod_enrolled: s.cod_enrolled,
    }))
  };
}
