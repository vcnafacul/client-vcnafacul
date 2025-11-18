import { logout as logoutUrl, logoutAll as logoutAllUrl } from "../urls";

interface LogoutResponse {
  message: string;
}

/**
 * Faz logout do dispositivo atual, revogando o refresh token
 * @param refreshToken - O refresh token a ser revogado
 */
export async function logoutService(
  refreshToken: string
): Promise<LogoutResponse> {
  try {
    const response = await fetch(logoutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
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

