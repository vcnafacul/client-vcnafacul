import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoCategoria } from "../urls";

/**
 * ⚠️ **Aqui `nome` É enviado**, ao contrário do `createCategoria` do admin, que
 * deixa o backend gerar pelo pattern `<Prefixo> <Nq>|livre <Dmin>`. É o ponto
 * inteiro do ticket: o cursinho nomeia como quiser, inclusive "Enem Dia 1".
 *
 * ⚠️ `dono` NÃO viaja daqui. Quem o define é a api, a partir do JWT — mandar
 * um `dono` no corpo seria o cursinho assinando o próprio registro.
 */
export interface CreateCategoriaCursinhoInput {
  nome: string;
  exame: string;
  duracao: number;
  quantidadeTotalQuestao: number | null;
  descricao?: string;
}

export async function createCategoriaCursinho(
  input: CreateCategoriaCursinhoInput,
  token: string,
): Promise<ICategoria> {
  const response = await fetchWrapper(cursinhoCategoria, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (response.status === 201) {
    return await response.json();
  }

  const err = await response.json();
  if (response.status === 409) {
    throw new Error(err.message || "Você já tem uma categoria com esse nome");
  }
  if (response.status === 400) {
    throw new Error(err.message || "Dados inválidos");
  }
  throw new Error("Erro ao criar categoria");
}
