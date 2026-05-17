import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";

export async function listClassSimuladoMonths(
  classId: string,
  token: string
): Promise<ClassMonthsList> {
  const response = await fetchWrapper(`${classes}/${classId}/analytics/simulado`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao carregar lista de meses");
  return response.json();
}
