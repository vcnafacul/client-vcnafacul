import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/** Resposta de `PATCH collaborator/:id/active` (tickets-documentacao, 02). */
export interface ResultadoDaAtivacao {
  actived: boolean;
  /** A função depois da ação; ausente na api anterior ao card 02. */
  role?: { id: string; name: string } | null;
  /** Reativou devolvendo a função de antes da inativação. */
  funcaoRestaurada?: boolean;
}

/**
 * Ativa ou inativa com a intenção explícita — não alterna, então dois cliques
 * não invertem o estado. A recusa (403) traz o motivo, que vira o erro.
 */
export async function changeActive(
  token: string,
  id: string,
  actived: boolean,
): Promise<ResultadoDaAtivacao> {
  const response = await fetchWrapper(`${collaborator}/${id}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ actived }),
  });
  const corpo = await response.json().catch(() => ({}));
  if (response.status !== 200) {
    throw new Error(
      corpo.message ?? "Erro ao tentar alterar informação de colaborador",
    );
  }
  return { ...corpo, actived: corpo.actived ?? actived };
}
