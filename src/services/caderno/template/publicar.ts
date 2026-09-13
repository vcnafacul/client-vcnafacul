import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { corpoJson, ErroDeLint } from "./erros";
import { VersaoTemplate } from "./tipos";

/**
 * Publica o rascunho, virando a nova versão em vigor.
 *
 * ⚠️ Este é o endpoint que **recusa** o que o lint reprovou: `409` com a lista
 * de erros. A lista sobe como `ErroDeLint.erros`, um array de verdade, porque
 * a tela renderiza item por item — serializá-la dentro da mensagem deixaria o
 * coordenador sem saber o que consertar.
 */
export async function publicar(token: string): Promise<VersaoTemplate> {
  const response = await fetchWrapper(`${cadernoTemplate}/rascunho/publicar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const corpo = await corpoJson(response);
    const message =
      typeof corpo?.message === "string" && corpo.message.trim()
        ? corpo.message
        : "Não foi possível publicar o template";

    const erros = corpo?.erros;
    if (Array.isArray(erros) && erros.length > 0) {
      throw new ErroDeLint(message, erros.map(String));
    }
    throw new Error(message);
  }

  return response.json();
}
