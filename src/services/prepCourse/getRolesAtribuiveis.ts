import { EditRoleDto } from "@/dtos/roles/editRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { partnerPrepCourse } from "../urls";

/**
 * As funções que quem está logado pode atribuir a um colaborador (card 02 de
 * `convite-de-colaborador`).
 *
 * ⚠️ **Já filtradas no servidor**: quem só gerencia colaboradores não recebe as
 * funções de administração. Mesmo formato do `getRoles`.
 */
export async function getRolesAtribuiveis(
  token: string,
): Promise<EditRoleDto[]> {
  const response = await fetchWrapper(`${partnerPrepCourse}/role/atribuiveis`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) return await response.json();
  throw new Error("Erro ao buscar as funções");
}
