import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { cursinhoCategoria } from "../urls";

/**
 * ⚠️ O cursinho é resolvido pelo JWT na api — não vai parâmetro nenhum daqui.
 * É o que garante que um cursinho não liste categoria de outro nem alterando a
 * requisição.
 */
export async function getCategoriasCursinho(
  token: string,
): Promise<Paginate<ICategoria>> {
  const response = await fetchWrapper(`${cursinhoCategoria}?page=1&limit=500`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error(`${response.status} - Erro ao buscar categorias do cursinho`);
}
