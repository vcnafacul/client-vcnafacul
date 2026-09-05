import { ResultadosCartao } from "@/dtos/cartaoResposta/resultados";
import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function buscarResultados(
  matricula: string,
  token: string,
): Promise<ResultadosCartao> {
  const response = await fetchWrapper(
    `${cartaoResposta}/resultados?matricula=${encodeURIComponent(matricula)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200) {
    throw new Error("Aluno não encontrado nesse cursinho");
  }
  return response.json();
}
