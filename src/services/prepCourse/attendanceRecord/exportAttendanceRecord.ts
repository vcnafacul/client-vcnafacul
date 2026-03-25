import { attendanceRecord } from "@/services/urls";

export async function exportAttendanceRecord(
  token: string,
  classId: string,
  startDate: string,
  endDate: string,
  maxAbsencePercent: number,
): Promise<void> {
  const url = `${attendanceRecord}/export?classId=${classId}&startDate=${startDate}&endDate=${endDate}&maxAbsencePercent=${maxAbsencePercent}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = "Erro ao exportar relatório";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // response body is not JSON
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `frequencia-${startDate}-${endDate}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
