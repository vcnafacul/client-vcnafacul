import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoProva } from "../urls";

/**
 * Card 41 — exclui a prova do cursinho. A api recusa (409) prova em evento de
 * simulado ou com cartão enviado, com o motivo na mensagem.
 */
export async function excluirProvaCursinho(
  id: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(
    `${cursinhoProva}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response.ok) return;
  const res = await response.json().catch(() => null);
  const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
  throw new Error(msg || "Erro ao excluir a prova");
}
