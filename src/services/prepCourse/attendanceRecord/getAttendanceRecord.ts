import { attendanceRecord } from "@/services/urls";
import { AttendanceRecordHistory, SimpleAttendanceRecordHistory } from "@/types/partnerPrepCourse/attendanceRecordHistory";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getAttendanceRecord(token: string, page: number, limit: number, classId: string): Promise<Paginate<SimpleAttendanceRecordHistory>> {
  const url = new URL(attendanceRecord);
  const params: Record<string, string | number> = {
    page,
    limit
  };
  params.classId = classId;
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

  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return {
    data: res.data.map((item: AttendanceRecordHistory) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      registeredAt: item.registeredAt,
      registeredBy: item.registeredBy.user.firstName + " " + item.registeredBy.user.lastName
    })),
    page: res.page,
    limit: res.limit,
    totalItems: res.totalItems
  };
}
