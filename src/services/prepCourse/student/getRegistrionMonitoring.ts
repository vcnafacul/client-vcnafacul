import { registrationMonitoring } from "@/services/urls";
import { RegistrationMonitoring } from "@/types/partnerPrepCourse/registrationMonitoring";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getRegistrationMonitoring(
  token: string
): Promise<RegistrationMonitoring[]> {
  const response = await fetchWrapper(registrationMonitoring, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar monitoração de inscrições");
  }
  return res as RegistrationMonitoring[];
}
