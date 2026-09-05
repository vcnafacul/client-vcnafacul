import { cartaoResposta } from "@/services/urls";

export async function baixarCartao(
  simuladoId: string,
  token: string,
): Promise<Blob> {
  const response = await fetch(`${cartaoResposta}/${simuladoId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Erro ao baixar o cartão");
  }
  return response.blob();
}
