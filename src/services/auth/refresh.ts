import { refresh as refreshUrl } from "../urls";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Renova o access token usando o refresh token
 * @param refreshToken - O refresh token válido
 * @returns Nova resposta com access_token e refresh_token
 */
export async function refreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Falha ao renovar token");
  }

  return response.json();
}

