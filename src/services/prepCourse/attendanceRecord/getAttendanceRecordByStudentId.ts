import { attendanceRecord } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

interface AttendanceRecord {
  id: string;
  class: {
    id: string;
    name: string;
  };
  registeredAt: Date;
  studentAttendance: StudentAttendance[];
  registeredBy: {
    name: string;
    email: string;
  }
  createdAt: Date;
}

interface StudentAttendance {
  id: string;
  present: boolean;
  justification?: {
    justification: string
  };
  student: {
    name: string;
    cod_enrolled: string;
  }
}

export async function getAttendanceRecordByStudentId(token: string, page: number, limit: number, studentId: string): Promise<Paginate<AttendanceRecord>> {
  const url = new URL(`${attendanceRecord}/student`);
  const params: Record<string, string | number> = {
    page,
    limit
  };
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
  console.log(res);
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("Ocoorreu um erro inesperado");
  }
  return res;
}
