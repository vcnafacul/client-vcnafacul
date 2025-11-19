import { collaborator } from "@/services/urls";

export async function getPhotoCollaborator(key: string): Promise<Blob> {
  const response = await fetch(`${collaborator}/${key}/photo`);

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
