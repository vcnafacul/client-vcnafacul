import { attendanceRecord } from "@/services/urls";
import { AttendanceRecord } from "@/types/partnerPrepCourse/attendanceRecord";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getAttendanceRecordByStudentId(token: string, page: number, limit: number, id: string, studentId: string): Promise<Paginate<AttendanceRecord>> {
  const url = new URL(`${attendanceRecord}/student`);
  const params: Record<string, string | number> = {
    page,
    limit
  };
  params.id = id;
  params.studentId = studentId;
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );

  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res : Paginate<AttendanceRecord> = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Ocoorreu um erro inesperado");
  }
  console.log(res);
  return res;
}
