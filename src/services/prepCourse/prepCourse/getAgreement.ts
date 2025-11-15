import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getAgreement(token: string, id: string): Promise<Blob> {
  const url = new URL(`${partnerPrepCourse}/agreement/${id}`);
  const res = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Erro ao buscar o contrato");
  }
  const { buffer, contentType } = await res.json();

  // Decodificar o buffer Base64 e criar um Blob
  const binaryString = atob(buffer); // Decodificar Base64
  const binaryData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    binaryData[i] = binaryString.charCodeAt(i);
  }
  return new Blob([binaryData], { type: contentType });
}
