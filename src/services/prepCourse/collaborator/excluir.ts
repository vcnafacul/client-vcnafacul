import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/** Resposta de `PATCH collaborator/:id/excluir` (tickets/040, card 04). */
export interface ResultadoDaExclusao {
  id: string;
  /** O perfil que a pessoa recebeu. */
  role: { id: string; name: string };
}

/**
 * Exclui o colaborador: ele vira ex-membro e recebe `roleId` (um perfil
 * recomendado) ou, sem ele, `aluno`. A recusa (400/403/404) traz o motivo.
 */
export async function excluirColaborador(
  token: string,
  id: string,
  roleId?: string,
): Promise<ResultadoDaExclusao> {
  const response = await fetchWrapper(`${collaborator}/${id}/excluir`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roleId ? { roleId } : {}),
  });
  const corpo = await response.json().catch(() => ({}));
  if (response.status !== 200) {
    throw new Error(corpo.message ?? "Erro ao excluir colaborador");
  }
  return corpo;
}
