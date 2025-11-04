import { enrollmentCertificate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getEnrollmentCertificate(
  studentId: string,
  token: string
): Promise<string> {
  const response = await fetchWrapper(`${enrollmentCertificate}/${studentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    const res = await response.json();
    throw new Error(res.message);
  }

  // 1. Converte resposta para Blob (PDF)
  const blob = await response.blob();

  // 2. Cria uma URL temporária para o PDF
  const url = window.URL.createObjectURL(blob);

  // 3. Abre em nova aba/janela
  window.open(url, "_blank");

  // Se quiser também pode retornar a URL para download manual
  return url;
}
