import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";

/**
 * Restaura uma versão antiga como novo rascunho.
 *
 * ⚠️ **Não manda notas**: o ms as ignora e escreve as suas próprias
 * ("restaurada da versão N"). E a resposta vem sem corpo — quem quiser o
 * estado novo recarrega com `obterRascunho`/`listarVersoes`.
 */
export async function restaurar(versao: number, token: string): Promise<void> {
  const response = await fetchWrapper(
    `${cadernoTemplate}/versoes/${versao}/restaurar`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Não foi possível restaurar a versão"),
    );
  }
}
