import { News } from "../../dtos/news/news";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { news } from "../urls";

export async function getAllNews(
  token: string,
  page: number = 1,
  limit: number = 40,
  status: StatusEnum
): Promise<Paginate<News>> {
  const res = await fetchWrapper(
    `${news}?page=${page}&limit=${limit}&status=${status}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (res.status !== 200) {
    throw new Error("Erro ao Recuperar Novidades");
  }
  return await res.json();
}
