import fetchWrapper from "@/utils/fetchWrapper";
import { termOfUse } from "../urls";

export async function getTermOfUse(id: string, token: string) {
  const response = await fetchWrapper(`${termOfUse}/${id}`, {
    method: "GET",
    headers: {
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
