import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeFeatureImage } from "../urls";

export async function uploadHomeFeatureImage(
  id: number,
  file: File,
  token: string,
): Promise<HomeFeature> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetchWrapper(homeFeatureImage(id), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error("Erro ao enviar imagem da Feature");
  }
  return await res.json();
}
