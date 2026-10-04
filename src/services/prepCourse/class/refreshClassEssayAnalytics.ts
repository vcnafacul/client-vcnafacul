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
  if (!response.ok) {
    // Leva o status: 403 vira "sem permissão" no toast (card 07).
    const corpo = await response.json().catch(() => ({}));
    throw { ...corpo, status: response.status };
  }
  return response.json();
}
