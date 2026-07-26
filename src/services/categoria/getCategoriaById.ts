import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { categoriaById } from "../urls";

export async function getCategoriaById(
  id: string,
  token: string,
): Promise<ICategoria> {
  const response = await fetchWrapper(categoriaById(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar categoria ${id}`);
  }
  return await response.json();
}
