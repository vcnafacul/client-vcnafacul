import { SerieDoEstudante } from "@/dtos/relatorioSimulado/relatorioSimulado";
import fetchWrapper from "@/utils/fetchWrapper";
import { relatorioSimulado } from "../urls";

/**
 * As aplicações de um estudante, em ordem de data — "o Pedro melhorou?".
 *
 * ⚠️ **COM turma no caminho, ao contrário do `buscarDetalheDoEstudante`.** Lá o
 * `userId` já identifica a pessoa e turma não acrescenta nada; aqui o recorte
 * define contra QUEM o aluno é comparado — a média de cada ponto é a do
 * recorte, e "melhorou em relação à turma" e "em relação ao cursinho" são
 * perguntas diferentes.
 */
export async function buscarSerieDoEstudante(
  token: string,
  userId: string,
  turmaId?: string,
): Promise<SerieDoEstudante> {
  const caminho = turmaId
    ? `${relatorioSimulado}/serie/estudante/${userId}/turma/${turmaId}`
    : `${relatorioSimulado}/serie/estudante/${userId}`;

  const response = await fetchWrapper(caminho, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar a série do estudante");
  }
  return await response.json();
}
