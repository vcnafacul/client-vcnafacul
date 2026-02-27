import { declarationConfirm } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function confirmDeclaration(
  studentId: string,
  token: string,
) {
  const response = await fetchWrapper(declarationConfirm, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId }),
  });

  if (!response.ok) {
    let message = "Erro ao confirmar declaração. Tente novamente.";
    try {
      const data = await response.json();
      if (data?.message && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(message);
  }
}
