import { HomeAbout } from "../../dtos/homeContent/homeAbout";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeAboutThumbnail } from "../urls";

export async function uploadHomeAboutThumbnail(
  file: File,
  token: string,
): Promise<HomeAbout> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetchWrapper(homeAboutThumbnail, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error("Erro ao enviar thumbnail");
  }
  return await res.json();
}
