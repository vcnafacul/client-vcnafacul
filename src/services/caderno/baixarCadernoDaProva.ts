import { caderno } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./baixarCaderno";

/**
 * tickets/038 — o caderno DA PROVA (Enem Dia 1/2 do cursinho): 1–5 Inglês, 1–5 Espanhol e
 * 6–90 no Dia 1. Mesmo contrato do `baixarCaderno` (avisos no header, erro com o motivo).
 */
export async function baixarCadernoDaProva(
  provaId: string,
  token: string,
): Promise<{ blob: Blob; avisos: number }> {
  const response = await fetchWrapper(`${caderno}/prova/${provaId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await mensagemDoErro(response));
  }
  const avisos = Number(response.headers.get("X-Caderno-Avisos") ?? 0);
  return {
    blob: await response.blob(),
    avisos: Number.isNaN(avisos) ? 0 : avisos,
  };
}
