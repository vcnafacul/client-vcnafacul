import { refresh as refreshUrl } from "../urls";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Renova o access token usando o refresh token (via cookie httpOnly)
 * O refresh token é enviado automaticamente via cookie
 * @returns Nova resposta com access_token (refresh_token atualizado no cookie)
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  const response = await fetch(refreshUrl, {
    method: "POST",
    credentials: "include", // ✅ Envia cookie automaticamente
  });

  if (!response.ok) {
    throw new Error("Falha ao renovar token");
  }

  return response.json();
}

