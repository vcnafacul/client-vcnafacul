import { prova } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getProvaFile(
  key: string,
  token: string
): Promise<Blob> {
  const response = await fetchWrapper(`${prova}/${key}/file`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

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
