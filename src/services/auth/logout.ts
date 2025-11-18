import { logout as logoutUrl, logoutAll as logoutAllUrl } from "../urls";

interface LogoutResponse {
  message: string;
}

/**
 * Faz logout do dispositivo atual, revogando o refresh token (via cookie)
 * O refresh token é enviado automaticamente via cookie e será limpo pelo servidor
 */
export async function logoutService(): Promise<LogoutResponse> {
  try {
    const response = await fetch(logoutUrl, {
      method: "POST",
      credentials: "include", // ✅ Envia cookie automaticamente
    });

    if (!response.ok) {
      console.warn("Falha ao fazer logout no servidor");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    // Continua o logout mesmo com erro no servidor
    return { message: "Logout local realizado" };
  }
}

/**
 * Faz logout de todos os dispositivos do usuário
 * @param accessToken - Token de acesso válido (requer autenticação)
 */
export async function logoutAllService(
  accessToken: string
): Promise<LogoutResponse> {
  try {
    const response = await fetch(logoutAllUrl, {
      method: "POST",
      credentials: "include", // ✅ Envia cookie automaticamente
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao fazer logout de todos dispositivos");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao fazer logout de todos dispositivos:", error);
    throw error;
  }
}

