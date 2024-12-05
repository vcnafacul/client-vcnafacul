import fetchWrapper from "../../utils/fetchWrapper";
import { geolocations } from "../urls";

export interface ReportMapHome {
  entity: string;
  entityId: string;
  message: string;
  address: boolean;
  contact: boolean;
  other: boolean;
}

export async function reportMapHome(
  body: ReportMapHome
): Promise<void> {
  const response = await fetchWrapper(`${geolocations}/report-map-home`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (response.status !== 201) {
    throw new Error("Erro ao gerar report");
  }
}
