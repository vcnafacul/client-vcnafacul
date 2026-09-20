import type { BuscaDeEstudantes } from "@/dtos/cartaoResposta/buscaEstudante";
import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * Estudantes do cursinho por matrícula ou nome, para o autocomplete do envio.
 *
 * ⚠️ **O cursinho não viaja na requisição** — sai do JWT do outro lado. É o que
 * impede um colaborador de enxergar estudante de outro cursinho ao digitar um
 * nome comum, e por isso não há parâmetro de cursinho aqui para alguém achar
 * que pode passar.
 */
export async function buscarEstudantes(
  termo: string,
  token: string,
): Promise<BuscaDeEstudantes> {
  const response = await fetchWrapper(
    `${cartaoResposta}/buscar-estudantes?termo=${encodeURIComponent(termo)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    throw new Error("Não foi possível buscar os estudantes");
  }
  return response.json();
}
