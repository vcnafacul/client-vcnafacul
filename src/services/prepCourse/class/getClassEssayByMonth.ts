import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { ClassEssayMonthAnalytics } from "@/types/classAnalytics/classEssayAnalytics";

export async function getClassEssayByMonth(
  classId: string,
  month: string,
  token: string
): Promise<ClassEssayMonthAnalytics | null> {
  const response = await fetchWrapper(
    `${classes}/${classId}/analytics/redacao/${month}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Falha ao carregar relatório");
  return response.json();
}
