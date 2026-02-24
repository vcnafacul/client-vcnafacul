import { VerifyDeclaredInscriptionDto } from "@/dtos/inscription/verifyDeclaredInscriptionDto";
import { declaredInterest } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function verifyDeclaredInterest(
  inscriptionId: string,
  token: string,
): Promise<VerifyDeclaredInscriptionDto> {
  // Validações básicas antes de chamar o back — evitam erros genéricos
  if (!token?.trim()) {
    throw new Error(
      "Sessão expirada. Faça login novamente para visualizar as informações da sua inscrição.",
    );
  }

  if (!inscriptionId?.trim()) {
    throw new Error(
      "Link de declaração inválido ou incompleto. Verifique o endereço recebido ou solicite um novo link.",
    );
  }

  try {
    const response = await fetchWrapper(`${declaredInterest}/${inscriptionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 500) {
      throw new Error(
        'Não foi possível carregar as informações de inscrição. Por favor, tente novamente mais tarde ou entre em contato com nossa equipe de suporte ou com o cursinho.',
      );
    }

    if ([400, 404].includes(response.status)) {
      const res = await response.json();
      throw new Error(res.message);
    }

    return await response.json();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    // Quando o navegador mostra "Failed to fetch", normalmente a requisição
    // nem chegou a receber resposta do servidor (problema de rede, CORS, HTTPS, etc.).
    if (
      typeof message === "string" &&
      (message === "Failed to fetch" ||
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("load failed"))
    ) {
      throw new Error(
        "Não foi possível conectar ao servidor para carregar sua inscrição. Verifique sua conexão com a internet e tente novamente.",
      );
    }

    throw e;
  }
}
