import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { ClassEssayMonthsList } from "@/types/classAnalytics/classEssayAnalytics";

export async function listClassEssayMonths(
  classId: string,
  token: string
): Promise<ClassEssayMonthsList> {
  const response = await fetchWrapper(`${classes}/${classId}/analytics/redacao`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao carregar lista de meses (redação)");
  return response.json();
}
