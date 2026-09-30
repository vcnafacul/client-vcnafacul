import { News } from "../../dtos/news/news";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { newsAll } from "../urls";

export async function getAllNews(
  token: string,
  page: number = 1,
  limit: number = 40,
  status: StatusEnum
): Promise<Paginate<News>> {
  const res = await fetchWrapper(
    `${newsAll}?page=${page}&limit=${limit}&status=${status}`,
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

/**
 * Todas as novidades de um status, página por página. A lista V2 filtra e
 * ordena no navegador, então precisa da lista inteira — com uma página só,
 * quem passasse de 100 sumia.
 */
export async function getTodasAsNovidades(
  token: string,
  status: StatusEnum,
  porPagina = 100,
): Promise<News[]> {
  const todas: News[] = [];
  for (let page = 1; ; page++) {
    const { data, totalItems } = await getAllNews(token, page, porPagina, status);
    todas.push(...data);
    if (data.length === 0 || todas.length >= totalItems) return todas;
  }
}
