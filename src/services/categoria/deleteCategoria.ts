import fetchWrapper from "../../utils/fetchWrapper";
import { categoriaById } from "../urls";

export async function deleteCategoria(
  id: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(categoriaById(id), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200 || response.status === 204) {
    return;
  }

  if (response.status === 409) {
    const err = await response.json();
    const detalhes =
      err.simuladosUsando != null
        ? `${err.simuladosUsando} simulados usam essa categoria`
        : err.message;
    throw new Error(`Categoria em uso — ${detalhes}`);
  }
  throw new Error("Erro ao excluir categoria");
}
