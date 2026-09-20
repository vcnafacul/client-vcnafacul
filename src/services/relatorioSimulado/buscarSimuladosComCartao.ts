import { SimuladosComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * Quais simulados do cursinho têm cartão enviado — o card `04b`.
 *
 * ⚠️ Exige `gerenciarEstudantes` e um colaborador com cursinho: chamar sem isso
 * devolve 403. Ver o gate em `simuladosView`.
 */
export async function buscarSimuladosComCartao(
  token: string,
): Promise<SimuladosComCartao> {
  const response = await fetchWrapper(`${relatorioSimulado}/simulados`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar os simulados com cartão");
  }
  return await response.json();
}
