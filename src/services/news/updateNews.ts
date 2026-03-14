import { News } from "../../dtos/news/news";
import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

export interface UpdateNewsPayload {
  session?: string;
  title?: string;
  expire_at?: string | null;
}

export async function updateNews(
  id: string,
  payload: UpdateNewsPayload,
  token: string
): Promise<News> {
  const res = await fetchWrapper(`${news}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const response = await res.json();
  if (res.status !== 200) {
    throw new Error(response.message ?? "Erro ao atualizar novidade");
  }
  return response;
}
