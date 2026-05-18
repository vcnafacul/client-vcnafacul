import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { RefreshEssayResult } from "@/types/classAnalytics/classEssayAnalytics";

export async function refreshClassEssayAnalytics(
  classId: string,
  scope: "current" | "all",
  token: string
): Promise<RefreshEssayResult> {
  const url = `${classes}/${classId}/analytics/redacao/refresh${scope === "all" ? "?all=true" : ""}`;
  const response = await fetchWrapper(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao agendar atualização");
  return response.json();
}
