import { studentAttendance } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * Edição da presença (tickets-documentacao, card 05).
 * - `observation`: por que mudou — obrigatória, não é justificativa;
 * - `justification`: só para Ausente. Vazia remove; omitida mantém. Para
 *   Presente a api remove a que houver.
 */
export interface EdicaoDePresenca {
  present: boolean;
  observation: string;
  justification?: string;
}

export async function updateRegisterStudent(
  token: string,
  id: string,
  edicao: EdicaoDePresenca,
): Promise<void> {
  const response = await fetchWrapper(`${studentAttendance}/present`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id, ...edicao }),
  });

  if (response.status !== 200) {
    const res = await response.json().catch(() => ({}));
    const mensagem = Array.isArray(res.message)
      ? res.message.join(" ")
      : res.message;
    throw new Error(mensagem ?? "Um erro inesperado ocorreu");
  }
}
