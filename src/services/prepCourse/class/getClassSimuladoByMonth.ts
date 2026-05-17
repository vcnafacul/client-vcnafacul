import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { ClassMonthAnalytics } from "@/types/classAnalytics/classSimuladoAnalytics";

export async function getClassSimuladoByMonth(
  classId: string,
  month: string,
  token: string
): Promise<ClassMonthAnalytics | null> {
  const response = await fetchWrapper(
    `${classes}/${classId}/analytics/simulado/${month}`,
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
