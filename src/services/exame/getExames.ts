import { IExameRef } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { exame } from "../urls";

/**
 * ⚠️ Existe porque o dropdown de exame do `ManageCategorias` era derivado da
 * lista de categorias. Com o recorte por dono, um cursinho novo tem zero
 * categorias — e ficaria sem nenhum exame para escolher, sem conseguir criar a
 * primeira.
 *
 * ⚠️ A resposta é **envelope paginado**, não array: quem consome lê `.data`.
 */
export async function getExames(token: string): Promise<Paginate<IExameRef>> {
  /**
   * ⚠️ `limit=500` explícito. MEDIDO: `v1/exame` do ms usa `GetAllDtoInput`,
   * então sem parâmetro o teto é **40** e a resposta é um envelope paginado —
   * não um array. Hoje são poucos exames, mas passando de 40 o dropdown
   * truncaria **sem erro nenhum**. 500 é o `LIMITE_MAXIMO` do ms.
   */
  const response = await fetchWrapper(`${exame}?page=1&limit=500`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar exames ${res.message}`);
  }
  return res;
}
