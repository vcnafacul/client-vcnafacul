import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";
import { VersaoTemplate } from "./tipos";

/** O histórico de versões, já em ordem decrescente vinda do ms. */
export async function listarVersoes(token: string): Promise<VersaoTemplate[]> {
  const response = await fetchWrapper(`${cadernoTemplate}/versoes`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Erro ao carregar o histórico de versões"),
    );
  }

  return response.json();
}
