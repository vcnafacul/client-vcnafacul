import fetchWrapper from "../../utils/fetchWrapper";
import { partnerPrepCourse } from "../urls";

/**
 * Troca a função de um colaborador do cursinho (card 02 de
 * `convite-de-colaborador`).
 *
 * ⚠️ **No lugar do `user/updateRole`**, que ficou só para a plataforma. A
 * recusa (403) traz o motivo — e ele é o erro lançado, para a tela mostrar.
 */
export async function atribuirFuncaoColaborador(
  userId: string,
  roleId: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(`${partnerPrepCourse}/collaborator-role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, roleId }),
  });
  if (response.status === 200) return;
  const corpo = await response.json().catch(() => ({}));
  throw new Error(corpo.message ?? "Erro ao trocar a função do colaborador");
}
