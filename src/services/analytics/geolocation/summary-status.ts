import { geo_summary_status } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface GeolocationSummary {
  approvedUniversities: number;
  pendingUniversities: number;
  rejectedUniversities: number;
  withReportUniversities: number;
  totalUniversities: number;
  approvedCourses: number;
  pendingCourses: number;
  rejectedCourses: number;
  withReportCourses: number;
  totalCourses: number;
}

export async function geolocationSummary(
  token: string
): Promise<GeolocationSummary> {
  const response = await fetchWrapper(geo_summary_status, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de geolocation`);
  }

  return res;
}
