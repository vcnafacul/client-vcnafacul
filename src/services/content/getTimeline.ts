import type { EventoDaTimeline } from "@/dtos/content/timelineDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function getTimeline(
  contentId: string,
  token: string,
): Promise<EventoDaTimeline[]> {
  const response = await fetchWrapper(`${content}/${contentId}/timeline`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const corpo = await response.json().catch(() => ({}));
  if (response.status !== 200) {
    throw new Error(corpo?.message || "Não foi possível carregar o histórico");
  }
  return corpo.eventos ?? [];
}
