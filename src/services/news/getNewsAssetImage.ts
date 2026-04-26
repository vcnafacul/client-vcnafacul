import { news } from "../urls";

export async function getNewsAssetImage(
  key: string,
  _token: string
): Promise<Blob> {
  const response = await fetch(`${news}/file/${encodeURIComponent(key)}`);
  if (!response.ok) {
    throw new Error("Erro ao buscar imagem da novidade");
  }
  return await response.blob();
}
