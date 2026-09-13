import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { mensagemDoErro } from "./erros";

/** Joga fora o rascunho em edição. Responde 204 — sem corpo para ler. */
export async function descartarRascunho(token: string): Promise<void> {
  const response = await fetchWrapper(`${cadernoTemplate}/rascunho`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      await mensagemDoErro(response, "Não foi possível descartar o rascunho"),
    );
  }
}
