import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoProva } from "../urls";

/**
 * Duplica a prova do cursinho (tickets/027): mesmas questões, mesmos números.
 * A resposta tem o formato de um item da lista de provas.
 */
export async function duplicarProvaCursinho(
  id: string,
  nome: string,
  token: string,
): Promise<Prova> {
  const response = await fetchWrapper(
    `${cursinhoProva}/${encodeURIComponent(id)}/duplicar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome }),
    },
  );
  const res = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
    throw new Error(msg || "Erro ao duplicar a prova");
  }
  return res;
}
