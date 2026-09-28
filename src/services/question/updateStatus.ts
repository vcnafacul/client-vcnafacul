import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

/** Uma prova que impede a recusa (tickets/024, card 03). */
export interface ProvaQueImpede {
  provaId: string;
  provaNome: string;
  cursinhoId: string | null;
}

/**
 * O erro do status, com o que a tela precisa: quando o validador do cursinho
 * não pode recusar, o ms responde 403 com as `provas` que usam a questão — é
 * o que abre o modal (card 05).
 */
export class ErroDoStatus extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly provas?: ProvaQueImpede[],
  ) {
    super(message);
  }
}

export async function updateStatus(
  id: string,
  status: StatusEnum,
  token: string,
  message?: string,
): Promise<boolean> {
  const response = await fetchWrapper(`${questoes}/${id}/${status}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (response.status !== 200) {
    const res = await response.json().catch(() => ({}));
    throw new ErroDoStatus(
      res?.message ?? "Erro ao editar status da questão",
      response.status,
      Array.isArray(res?.provas) ? res.provas : undefined,
    );
  }
  return true;
}
