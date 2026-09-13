import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";
import { VersaoTemplate } from "./tipos";

/**
 * O rascunho em edição, se houver.
 *
 * ⚠️ Devolve `null` no `404` em vez de lançar: "não há rascunho" é o estado
 * normal da tela — é assim que ela sabe mostrar "suba um zip" em vez de um
 * toast de erro.
 */
export async function obterRascunho(
  token: string,
): Promise<VersaoTemplate | null> {
  const response = await fetchWrapper(`${cadernoTemplate}/rascunho`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Erro ao carregar o rascunho"),
    );
  }

  return response.json();
}
