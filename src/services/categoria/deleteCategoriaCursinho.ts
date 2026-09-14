import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoCategoriaById } from "../urls";

export async function deleteCategoriaCursinho(
  id: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(cursinhoCategoriaById(id), {
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
    const partes: string[] = [];
    if (err.simuladosUsando > 0) partes.push(`${err.simuladosUsando} simulados`);
    if (err.provasUsando > 0) partes.push(`${err.provasUsando} provas`);
    const detalhes =
      partes.length > 0 ? `${partes.join(" e ")} usam essa categoria` : err.message;
    throw new Error(`Categoria em uso — ${detalhes}`);
  }
  /**
   * ⚠️ 403 é novo neste fluxo: o ms recusa excluir categoria de outro dono.
   * Sem esta linha a pessoa recebe "Erro ao excluir categoria" e não entende.
   */
  if (response.status === 403) {
    throw new Error("Essa categoria não é do seu cursinho");
  }
  throw new Error("Erro ao excluir categoria");
}
