import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";
import { VersaoTemplate } from "./tipos";

/**
 * A versão do template em vigor.
 *
 * ⚠️ Devolve `null` no `404`: plataforma que nunca publicou um template é
 * estado normal da tela (o ms cai no template embutido), não erro.
 */
export async function obterPublicada(
  token: string,
): Promise<VersaoTemplate | null> {
  const response = await fetchWrapper(cadernoTemplate, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Erro ao carregar o template publicado"),
    );
  }

  return response.json();
}
