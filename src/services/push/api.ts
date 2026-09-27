import fetchWrapper from "@/utils/fetchWrapper";
import { pushDevices, pushDevicesMe, pushTest } from "../urls";

export type PlataformaDoAparelho = "android" | "ios" | "desktop" | "other";

export type DadosDoAparelho = {
  token: string;
  platform: PlataformaDoAparelho;
  standalone: boolean;
  userAgent: string;
};

export type AparelhoAtivo = {
  id: string;
  platform: PlataformaDoAparelho;
  standalone: boolean;
  userAgent: string | null;
  lastSeenAt: string;
};

export async function registrarAparelho(
  dados: DadosDoAparelho,
  token: string,
): Promise<void> {
  const res = await fetchWrapper(pushDevices, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  if (res.status !== 204) {
    throw new Error("Não foi possível ativar as notificações neste aparelho");
  }
}

/**
 * ⚠️ **`fetch` puro, sem `fetchWrapper` e sem JWT.** O `DELETE` é público na
 * api (BE-04) justamente para funcionar no logout forçado, com a sessão já
 * expirada — e o `fetchWrapper` tentaria renovar a sessão e deslogar de novo.
 */
export async function removerAparelho(fcmToken: string): Promise<void> {
  await fetch(pushDevices, {
    method: "DELETE",
    // Sobrevive à página sendo descarregada (logout que navega em seguida).
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: fcmToken }),
  });
}

export async function listarMeusAparelhos(
  token: string,
): Promise<AparelhoAtivo[]> {
  const res = await fetchWrapper(pushDevicesMe, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Não foi possível listar os aparelhos");
  return res.json();
}

export async function enviarTeste(
  token: string,
): Promise<{ successCount: number; failureCount: number }> {
  const res = await fetchWrapper(pushTest, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok)
    throw new Error("Não foi possível enviar a notificação de teste");
  return res.json();
}
