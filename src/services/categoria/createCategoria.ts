import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { categoria } from "../urls";

export interface CreateCategoriaInput {
  exame: string;
  duracao: number;
  quantidadeTotalQuestao: number | null;
  prefixo?: string;
  descricao?: string;
  // nota: nome não é enviado — o backend gera o nome da categoria.
}

export async function createCategoria(
  input: CreateCategoriaInput,
  token: string,
): Promise<ICategoria> {
  const response = await fetchWrapper(categoria, {
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
    throw new Error(err.message || "Categoria já existe com esse nome");
  }
  if (response.status === 400) {
    throw new Error(err.message || "Dados inválidos");
  }
  throw new Error("Erro ao criar categoria");
}
