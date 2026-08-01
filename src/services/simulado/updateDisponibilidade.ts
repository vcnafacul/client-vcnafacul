import fetchWrapper from "../../utils/fetchWrapper";
import { simulado } from "../urls";

export interface DisponibilidadeInput {
  disponivelDe: Date | null;
  disponivelAte: Date | null;
}

export async function updateDisponibilidade(
  simuladoId: string,
  input: DisponibilidadeInput,
  token: string,
) {
  const response = await fetchWrapper(
    `${simulado}/${simuladoId}/disponibilidade`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        disponivelDe: input.disponivelDe ? input.disponivelDe.toISOString() : null,
        disponivelAte: input.disponivelAte
          ? input.disponivelAte.toISOString()
          : null,
      }),
    },
  );
  if (response.status !== 200) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erro ao atualizar disponibilidade");
  }
  return response.json();
}
