import { News } from "../../dtos/news/news";
import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

export interface CreateNewsTextPayload {
  title: string;
  contentType: 'text';
  body: string;
  description?: string;
  destaque?: boolean;
  expire_at?: string;
}

export async function createNews(
  data: FormData | CreateNewsTextPayload,
  token: string
): Promise<News> {
  const isJson = !(data instanceof FormData);
  const res = await fetchWrapper(news, {
    method: "POST",
    headers: isJson
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {
          Authorization: `Bearer ${token}`,
        },
    body: isJson ? JSON.stringify(data) : (data as FormData),
  });
  const response = await res.json();
  if (res.status === 201) return response;
  throw new Error(`Erro ao tentar criar novidades - ${response.message}`);
}
