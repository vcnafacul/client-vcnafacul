import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoProva } from "../urls";

export async function createProvaCursinho(
  data: FormData,
  token: string,
): Promise<Prova> {
  const response = await fetchWrapper(cursinhoProva, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  /*
    ⚠️ Qualquer erro vira exceção com a mensagem da api (tickets/023, card
    09). Antes só o 403 lançava: um 400/404 voltava como se fosse a prova
    criada, e a tela a pusesse na lista.
  */
  const corpo = await response.json().catch(() => ({}));
  if (response.status !== 201) {
    throw new Error(corpo?.message ?? "Erro ao criar a prova");
  }
  return corpo;
}
