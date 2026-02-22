import { getPartnerLogo as getPartnerLogoUrl } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getPartnerLogo(
  key: string,
  token: string,
): Promise<Blob> {
  const response = await fetchWrapper(`${getPartnerLogoUrl}/${key}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar o logo da universidade");
  }

  const { buffer, contentType } = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o arquivo");
  }
  // Decodificar o buffer Base64 e criar um Blob
  const binaryString = atob(buffer); // Decodificar Base64
  const binaryData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    binaryData[i] = binaryString.charCodeAt(i);
  }
  return new Blob([binaryData], { type: contentType });
}
