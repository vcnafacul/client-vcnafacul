import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

/**
 * Busca o arquivo da novidade na API e retorna como ArrayBuffer para renderização.
 * O endpoint é público (sem auth) e usa cache de 7 dias.
 */
export async function getNewsFile(fileKey: string): Promise<ArrayBuffer> {
  const url = `${news}/file/${encodeURIComponent(fileKey)}`;
  const response = await fetchWrapper(url, { method: "GET" });
  if (!response.ok) {
    throw new Error("Erro ao buscar o arquivo da novidade");
  }
  return response.arrayBuffer();
}
