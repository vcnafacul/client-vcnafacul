import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { RefreshResult } from "@/types/classAnalytics/classSimuladoAnalytics";

export async function refreshClassSimuladoAnalytics(
  classId: string,
  scope: "current" | "all",
  token: string
): Promise<RefreshResult> {
  const url = `${classes}/${classId}/analytics/simulado/refresh${scope === "all" ? "?all=true" : ""}`;
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
