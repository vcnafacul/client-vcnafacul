import { attendanceRecord } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function deleteAttendanceRecord(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${attendanceRecord}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
}
