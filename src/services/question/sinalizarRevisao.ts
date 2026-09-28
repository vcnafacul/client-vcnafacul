import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

/**
 * Pede à equipe da plataforma que revise a questão (tickets/024, card 04) —
 * o caminho de quem não pode recusá-la. Motivo de 10 a 500 caracteres.
 */
export async function sinalizarRevisao(
  id: string,
  motivo: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(`${questoes}/${id}/revisao`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ motivo }),
  });
  if (!response.ok) {
    const res = await response.json().catch(() => ({}));
    const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
    throw new Error(msg ?? "Erro ao sinalizar a questão");
  }
}
