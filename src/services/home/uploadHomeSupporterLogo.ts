import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import fetchWrapper from "../../utils/fetchWrapper";
import { homeSupporterLogo } from "../urls";

export async function uploadHomeSupporterLogo(
  id: number,
  file: File,
  token: string,
): Promise<HomeSupporter> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetchWrapper(homeSupporterLogo(id), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error("Erro ao enviar logo do Apoiador");
  }
  return await res.json();
}
