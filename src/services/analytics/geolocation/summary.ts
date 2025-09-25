import { geolocation_summary } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface GeolocationSummary {
  geoTotal: number;
  geoPending: number;
  geoApproved: number;
  geoRejected: number;
}

export async function geolocationSummary(
  token: string
): Promise<GeolocationSummary> {
  const response = await fetchWrapper(geolocation_summary, {
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
