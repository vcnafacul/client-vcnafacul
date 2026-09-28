import fetchWrapper from "../../utils/fetchWrapper";
import { provaById } from "../urls";

/**
 * Liga/desliga o "aplicar novas versões automaticamente" (tickets/023, card
 * 09). Só o dono da prova — quem não é recebe 403 com o motivo, que vira
 * a mensagem do erro.
 */
export async function alterarReceberNovasVersoes(
  provaId: string,
  valor: boolean,
  token: string,
): Promise<{ receberNovasVersoes: boolean }> {
  const response = await fetchWrapper(
    `${provaById(provaId)}/receber-novas-versoes`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ valor }),
    },
  );
  const corpo = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(corpo?.message ?? "Erro ao alterar a prova");
  }
  return corpo;
}
