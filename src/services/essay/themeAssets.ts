import fetchWrapper from "@/utils/fetchWrapper";
import { essayTheme } from "../urls";

/** Sobe uma imagem do texto motivador e devolve a referência `asset://<id>`. */
export async function uploadEssayThemeAsset(
  file: File,
  token: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetchWrapper(`${essayTheme}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (response.status !== 201) {
    const msg = await response
      .json()
      .then((b) => b?.message)
      .catch(() => null);
    throw new Error(msg || "Erro ao enviar imagem do texto motivador");
  }
  const { assetId } = await response.json();
  return `asset://${assetId}`;
}

/** O `fetchAsset` do editor e do renderer para as imagens do tema. */
export async function getEssayThemeAssetImage(
  key: string,
  token: string,
): Promise<Blob> {
  const response = await fetchWrapper(
    `${essayTheme}/asset/${encodeURIComponent(key)}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Erro ao buscar imagem do tema");
  return await response.blob();
}
