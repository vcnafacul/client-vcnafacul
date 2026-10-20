import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

/**
 * `reason` é obrigatório ao rejeitar: a api (e o ms) recusam `Rejected` sem
 * motivo — é o que quem enviou o material lê para saber o que corrigir.
 */
export async function updateStatus(
  id: string,
  status: StatusContent | StatusEnum,
  token: string,
  reason?: string,
): Promise<boolean> {
  const response = await fetchWrapper(`${content}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(reason ? { id, status, reason } : { id, status }),
  });
  if (response.status === 304 || response.status === 200) {
    return true;
  }
  const corpo = await response.json().catch(() => ({}));
  const mensagem = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
  throw new Error(mensagem || "Erro ao tentar atualizar status de conteúdo");
}
