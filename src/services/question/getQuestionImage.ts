import { questoes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * Busca a imagem/asset de uma questão.
 *
 * `key` pode ser o `imageId` legado (`<uuid>.png`, sem barra) ou a key de um
 * asset novo (`assets/<uuid>.png`, com barra — o upload joga na pasta `assets`).
 * A rota no api é `@Get(':id/image')`, de um segmento só: sem o encode a barra
 * vira separador de path, a URL ganha um segmento e não casa com rota nenhuma
 * → 404 silencioso. Com o encode, o Express entrega a key já decodificada, com
 * a barra, num `:id` único. O caminho legado é inerte ao encode.
 */
export async function getQuestionImage(key: string, token: string): Promise<Blob> {
  const response = await fetchWrapper(`${questoes}/${encodeURIComponent(key)}/image`, {
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
